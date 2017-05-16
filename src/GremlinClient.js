/*jslint -W079 */
/*jslint node: true */
import { EventEmitter } from 'events';

import uuid from 'node-uuid';
import _ from 'lodash';
import { gremlin, renderChain } from 'zer';

import WebSocketGremlinConnection from './WebSocketGremlinConnection';
import * as Utils from './utils';

import Rx from 'rx';


const hasCode = (filterCode) => ({ status: { code } }) => code === filterCode;

const isErrorMessage = ({ status: { code }}) => [200, 204, 206].indexOf(code) === -1;

const serializeToBinary = (message, accept) => {
  let serializedMessage = accept + JSON.stringify(message);
  serializedMessage = unescape(encodeURIComponent(serializedMessage));

  // Let's start packing the message into binary
  // mimeLength(1) + mimeType Length + serializedMessage Length
  let binaryMessage = new Uint8Array(1 + serializedMessage.length);
  binaryMessage[0] = accept.length;

  for (let i = 0; i < serializedMessage.length; i++) {
    binaryMessage[i + 1] = serializedMessage.charCodeAt(i);
  }

  return binaryMessage;
}

class GremlinClient extends EventEmitter {
  constructor(port = 8182, host = 'localhost', options = {}) {
    super();

    this.port = port;
    this.host = host;

    // Breaking change in v3.2.2, connect to /gremlin rather than /
    // See: https://groups.google.com/d/topic/gremlin-users/x4hiHsmTsHM/discussion
    const { path = '/gremlin' } = options;

    this.options = {
      language: 'gremlin-groovy',
      session: false,
      op: 'eval',
      processor: '',
      accept: 'application/json',
      ssl: false,
      rejectUnauthorized: true,
      ...options,
      path: path.length && !path.startsWith('/') ? `/${path}` : path,
    };

    this.useSession = this.options.session;

    if (this.useSession) {
      this.sessionId = uuid.v1();
    }

    this.connected = false;
    this.queue = [];

    this.commands = {};

    this.commands$ = new Rx.Subject();
    this.commands$.subscribe((command) => {
      const { message: { requestId } } = command;
      this.commands[requestId] = command
    });

    const { ssl, rejectUnauthorized } = this.options;

    const connection = this.createConnection({
      port,
      host,
      path: this.options.path,
      ssl,
      rejectUnauthorized,      
    });

    const connections$ = Rx.Observable.create((observer) => observer.next(connection));

    const open$ = connections$
      .flatMap((connection) => Rx.Observable.fromEvent(connection, 'open'));

    const error$ = connections$
      .flatMap((connection) => Rx.Observable.fromEvent(connection, 'error'));

    const incomingMessages$ = connections$
      .flatMap((connection) => Rx.Observable.fromEvent(connection, 'message'))
      .map(({ data }) => {
        const buffer = new Buffer(data, 'binary');
        const rawMessage = JSON.parse(buffer.toString('utf-8'));

        return rawMessage;
      });
    const close$ = connections$
      .flatMap((connection) => Rx.Observable.fromEvent(connection, 'close'));

    const canSend$ = Rx.Observable.merge(
      open$.map(true),
      error$.map(false),
      close$.map(false)
    )

    open$.subscribe((connection) => this.onConnectionOpen());
    error$.subscribe((error) => this.handleError(error));


    this.incomingMessages$ = incomingMessages$;

    close$.subscribe((event) => this.handleDisconnection(event));

    const outgoingMessages$ = this.commands$
      .map(({ message }) => serializeToBinary(message, this.options.accept))
      .pausableBuffered(canSend$)
      .combineLatest(connections$);

    outgoingMessages$
      .subscribe(([binaryMessage, connection]) =>
        connection.sendMessage(binaryMessage)
      );
  }

  createConnection({ port, host, path, ssl, rejectUnauthorized }) {
    return new WebSocketGremlinConnection({ port, host, path, ssl, rejectUnauthorized });
  }

  closeConnection() {
    this.connection.close();
  }

  handleError(err) {
    this.connected = false;
    this.emit('error', err);
  }

  warn(code, message) {
    this.emit('warning', {
      code,
      message,
    });
  }

  /**
   * Handle the WebSocket onOpen event, flag the client as connected and
   * process command queue.
   */
  onConnectionOpen() {
    this.connected = true;
    this.emit('connect');
  };

  /**
   * @param {CloseEvent} event
   */
  handleDisconnection(event) {
    this.cancelPendingCommands({
      message: 'WebSocket closed',
      details: event,
    });
  }

  /**
   * @param {Object} reason
   */
  cancelPendingCommands({ message, details }) {
    const commands = this.commands;
    let command;
    const error = new Error(message);
    error.details = details;

    // Empty queue
    this.queue.length = 0;
    this.commands = {};

    Object.keys(commands).forEach(key => {
      command = commands[key];
      command.messageStream.emit('error', error);
    });
  }

  /**
   * For a given script string and optional bound parameters, build a protocol
   * message object to be sent to Gremlin Server.
   *
   * @param {String|Function} script
   * @param {Object} bindings
   * @param {Object} message
   */
  buildMessage(rawScript, rawBindings = {}, baseMessage = {}) {
    let { gremlin, bindings } = Utils.buildQueryFromSignature(
      rawScript,
      rawBindings,
    );
    const { processor, op, accept, language, aliases } = this.options;

    const baseArgs = { gremlin, bindings, accept, language, aliases };
    const args = _.defaults(baseMessage.args || {}, baseArgs);

    const message = {
      requestId: uuid.v1(),
      processor,
      op,
      args,
      ...baseMessage,
    };

    if (this.useSession) {
      // Assume that people want to use the 'session' processor unless specified
      message.processor = message.processor || processor || 'session';
      message.args.session = this.sessionId;
    }

    return message;
  }

  /**
   * Asynchronously send a script to Gremlin Server for execution and fire
   * the provided callback when all results have been fetched.
   *
   * Callback signature: (Error, Array<result>)
   *
   * @public
   * @param {String|Function} script
   * @param {Object} bindings
   * @param {Object} message
   * @param {Function} callback
   */
  execute(script, bindings = {}, message = {}, callback) {
    callback = arguments[arguments.length - 1];

    if (typeof message === 'function') {
      callback = message;
      message = {};
    }

    this.observable(script, bindings, message)
      .toArray()
      .subscribe(
        (results) => callback(null, results),
        (err) => callback(err)
      )
  }

  observable(script, bindings, rawMessage) {
    const command = {
      message: this.buildMessage(script, bindings, rawMessage),
    }

    // This actually sends the command to Gremlin Server
    this.commands$.onNext(command);

    // Create a new Observable of of incoming messages, but filter only
    // incoming messages to the command we just send.
    const commandMessages$ = this.incomingMessages$
      .filter(({ requestId }) => requestId === command.message.requestId);

    // Off of these messages, create new Observables for each message code
    // TODO: this could be a custom operator.
    const successMessage$ = commandMessages$
      .filter(hasCode(200))
    const continuationMessages$ = commandMessages$
      .filter(hasCode(206))
    const noContentMessage$ = commandMessages$
      .filter(hasCode(204))
      // Rewrite these in order to ensure the callback is always fired with an
      // Empty Array rather than a null value.
      // Mutating is perfectly fine here.
      .map((message) => {
        message.result.data = []
        return message;
      });

    // That Observable will ultimately emit a single object which indicates
    // that we should not expect any other messages;
    const terminationMessages$ = Rx.Observable.merge(
      successMessage$, noContentMessage$
    );

    const errorMessages$ = commandMessages$
      .filter(isErrorMessage)
      .flatMap(({ status: { code, message } }) =>
        Rx.Observable.throw(new Error(message + ' (Error '+ code +')'))
      );

    const results$ = Rx.Observable.merge(
        successMessage$,
        continuationMessages$,
        noContentMessage$,
        errorMessages$
      )
      .flatMap(({ result: { data }}) => data)

      .takeUntil(terminationMessages$);

    return results$;
  }
}

export default GremlinClient;
