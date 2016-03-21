/*jslint -W079 */
/*jslint node: true */
import { EventEmitter } from 'events';

import uuid from 'node-uuid';
import _ from 'lodash';
import highland from 'highland';

import WebSocketGremlinConnection from './WebSocketGremlinConnection';
import MessageStream from './MessageStream';
import executeHandler from './executeHandler';
import * as Utils from './utils';


class GremlinClient extends EventEmitter {
  constructor(port = 8182, host = 'localhost', options = {}) {
    super();

    this.port = port;
    this.host = host;

    const { path = '' } = options;

    this.options = {
      language: 'gremlin-groovy',
      session: false,
      op: 'eval',
      processor: '',
      accept: 'application/json',
      executeHandler,
      ...options,
      path: path.length && !path.startsWith('/') ? `/${path}` : path
    }

    this.useSession = this.options.session;

    if (this.useSession) {
      this.sessionId = uuid.v1();
    }

    this.connected = false;
    this.queue = [];

    this.commands = {};

    this.connection = this.createConnection({
      port,
      host,
      path: this.options.path
    });
  }

  createConnection({ port, host, path }) {
    const connection = new WebSocketGremlinConnection({ port, host, path });

    connection.on('open', () => this.onConnectionOpen());
    connection.on('error', (error) => this.handleError(error));
    connection.on('message', (message) => this.handleProtocolMessage(message));
    connection.on('close', (event) => this.handleDisconnection(event))

    return connection;
  }

  handleError(err) {
    this.connected = false;
    this.emit('error', err);
  }

  /**
   * Process all incoming raw message events sent by Gremlin Server, and dispatch
   * to the appropriate command.
   *
   * @param {MessageEvent} event
   */
  handleProtocolMessage(message) {
    const { data } = message;
    const buffer = new Buffer(data, 'binary');
    const rawMessage = JSON.parse(buffer.toString('utf-8'));
    const {
      requestId,
      status: {
        code: statusCode,
        message: statusMessage
      }
    } = rawMessage;

    const { messageStream } = this.commands[requestId];

    switch (statusCode) {
      case 200: // SUCCESS
        delete this.commands[requestId]; // TODO: optimize performance
        messageStream.push(rawMessage);
        messageStream.push(null);
        break;
      case 204: // NO_CONTENT
        delete this.commands[requestId];
        messageStream.push(null);
        break;
      case 206: // PARTIAL_CONTENT
        messageStream.push(rawMessage);
        break;
      default:
        delete this.commands[requestId];
        messageStream.emit('error', new Error(statusMessage + ' (Error '+ statusCode +')'));
        break;
    }
  }

  /**
   * Handle the WebSocket onOpen event, flag the client as connected and
   * process command queue.
   */
  onConnectionOpen() {
    this.connected = true;
    this.emit('connect');

    this.executeQueue();
  };

  /**
   * @param {CloseEvent} event
   */
  handleDisconnection(event) {
    this.cancelPendingCommands({
      message: 'WebSocket closed',
      details: event
    });
  };

  /**
   * Process the current command queue, sending commands to Gremlin Server
   * (First In, First Out).
   */
  executeQueue() {
    while (this.queue.length > 0) {
      let { message } = this.queue.shift();
      this.sendMessage(message);
    }
  };

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

    Object.keys(commands).forEach((key) => {
      command = commands[key];
      command.messageStream.emit('error', error);
    });
  };

  /**
   * For a given script string and optional bound parameters, build a protocol
   * message object to be sent to Gremlin Server.
   *
   * @param {String|Function} script
   * @param {Object} bindings
   * @param {Object} message
   */
  buildMessage(rawScript, rawBindings = {}, baseMessage = {}) {
    let { gremlin, bindings } = Utils.buildQueryFromSignature(rawScript, rawBindings);
    const { processor, op, accept, language } = this.options;

    const baseArgs = { gremlin, bindings, accept, language };
    const args = _.defaults(baseMessage.args || {}, baseArgs);

    const message = {
      requestId: uuid.v1(),
      processor,
      op,
      args,
      ...baseMessage
    };

    if (this.useSession) {
      // Assume that people want to use the 'session' processor unless specified
      message.processor = message.processor || processor || 'session';
      message.args.session = this.sessionId;
    }

    return message;
  };

  sendMessage(message) {
    const serializedMessage = this.options.accept + JSON.stringify(message);

    // Let's start packing the message into binary
    // mimeLength(1) + mimeType Length + serializedMessage Length
    let binaryMessage = new Uint8Array(1 + serializedMessage.length);
    binaryMessage[0] = this.options.accept.length;

    for (let i = 0; i < serializedMessage.length; i++) {
      binaryMessage[i + 1] = serializedMessage.charCodeAt(i);
    }

    this.connection.sendMessage(binaryMessage);
  };

  /**
   * Asynchronously send a script to Gremlin Server for execution and fire
   * the provided callback when all results have been fetched.
   *
   * This method internally uses a stream to handle the potential concatenation
   * of results.
   *
   * Callback signature: (Error, Array<result>)
   *
   * @public
   * @param {String|Function} script
   * @param {Object} bindings
   * @param {Object} message
   * @param {Function} callback
   */
  execute(script, bindings = {}, message = {}, ...args) {
    let callback = args[args.length - 1];

    if (typeof message === 'function') {
      callback = message;
      message = {};
    }

    const messageStream = this.messageStream(script, bindings, message);

    // TO CHECK: errors handling could be improved
    // See https://groups.google.com/d/msg/nodejs/lJYT9hZxFu0/L59CFbqWGyYJ
    // for an example using domains
    const { executeHandler } = this.options;

    executeHandler(messageStream, callback);
  }

  /**
   * Execute the script and return a stream of distinct/single results.
   * This method reemits a distinct data event for each returned result, which
   * makes the stream behave as if `resultIterationBatchSize` was set to 1.
   *
   * If you do not wish this behavior, please use client.messageStream() instead.
   *
   * Even though this method uses Highland.js internally, it does not return
   * a high level Highland readable stream so we do not risk having to deal
   * with unexpected API breaking changes as Highland.js evolves.
   *
   * @return {ReadableStream} A Node.js Stream2
   */
  stream(script, bindings, message) {
    const messageStream = this.messageStream(script, bindings, message);
    const _ = highland; // override lo-dash locally

    // Create a local highland 'through' pipeline so we don't expose
    // a Highland stream to the end user, but a standard Node.js Stream2
    const through = _.pipeline(
      _.map(({ result: { data }}) => data),
      _.sequence()
    );

    let rawStream = messageStream.pipe(through);

    messageStream.on('error', (e) => {
      rawStream.emit('error', new Error(e));
    });

    return rawStream;
  };

  /**
   * Execute the script and return a stream of raw messages returned by Gremlin
   * Server.
   * This method does not reemit one distinct data event per result. It directly
   * emits the raw messages returned by Gremlin Server as they are received.
   *
   * Although public, this is a low level method intended to be used for
   * advanced usages.
   *
   * @public
   * @param {String|Function} script
   * @param {Object} bindings
   * @param {Object} message
   * @return {MessageStream}
   */
  messageStream(script, bindings, rawMessage) {
    let stream = new MessageStream({ objectMode: true });

    const command = {
      message: this.buildMessage(script, bindings, rawMessage),
      messageStream: stream
    };

    this.sendCommand(command); //todo improve for streams

    return stream;
  };

  /**
   * Send a command to Gremlin Server, or add it to queue if the connection
   * is not established.
   *
   * @param {Object} command
   */
  sendCommand(command) {
    const {
      message,
      message: {
        requestId
      }
    } = command;

    this.commands[requestId] = command;

    if (this.connected) {
      this.sendMessage(message);
    } else {
      this.queue.push(command);
    }
  };
}

export default GremlinClient;
