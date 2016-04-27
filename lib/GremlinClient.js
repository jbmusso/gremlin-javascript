'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _highland = require('highland');

var _highland2 = _interopRequireDefault(_highland);

var _WebSocketGremlinConnection = require('./WebSocketGremlinConnection');

var _WebSocketGremlinConnection2 = _interopRequireDefault(_WebSocketGremlinConnection);

var _MessageStream = require('./MessageStream');

var _MessageStream2 = _interopRequireDefault(_MessageStream);

var _executeHandler = require('./executeHandler');

var _executeHandler2 = _interopRequireDefault(_executeHandler);

var _utils = require('./utils');

var Utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*jslint -W079 */
/*jslint node: true */


var GremlinClient = function (_EventEmitter) {
  _inherits(GremlinClient, _EventEmitter);

  function GremlinClient() {
    var port = arguments.length <= 0 || arguments[0] === undefined ? 8182 : arguments[0];
    var host = arguments.length <= 1 || arguments[1] === undefined ? 'localhost' : arguments[1];
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, GremlinClient);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GremlinClient).call(this));

    _this.port = port;
    _this.host = host;

    var _options$path = options.path;
    var path = _options$path === undefined ? '' : _options$path;


    _this.options = _extends({
      language: 'gremlin-groovy',
      session: false,
      op: 'eval',
      processor: '',
      accept: 'application/json',
      tls: false,
      executeHandler: _executeHandler2.default
    }, options, {
      path: path.length && !path.startsWith('/') ? '/' + path : path
    });

    _this.useSession = _this.options.session;

    if (_this.useSession) {
      _this.sessionId = _nodeUuid2.default.v1();
    }

    _this.connected = false;
    _this.queue = [];

    _this.commands = {};

    _this.connection = _this.createConnection({
      port: port,
      host: host,
      path: _this.options.path,
      tls: _this.options.tls
    });
    return _this;
  }

  _createClass(GremlinClient, [{
    key: 'createConnection',
    value: function createConnection(_ref) {
      var _this2 = this;

      var port = _ref.port;
      var host = _ref.host;
      var path = _ref.path;
      var tls = _ref.tls;

      var connection = new _WebSocketGremlinConnection2.default({ port: port, host: host, path: path, tls: tls });

      connection.on('open', function () {
        return _this2.onConnectionOpen();
      });
      connection.on('error', function (error) {
        return _this2.handleError(error);
      });
      connection.on('message', function (message) {
        return _this2.handleProtocolMessage(message);
      });
      connection.on('close', function (event) {
        return _this2.handleDisconnection(event);
      });

      return connection;
    }
  }, {
    key: 'handleError',
    value: function handleError(err) {
      this.connected = false;
      this.emit('error', err);
    }

    /**
     * Process all incoming raw message events sent by Gremlin Server, and dispatch
     * to the appropriate command.
     *
     * @param {MessageEvent} event
     */

  }, {
    key: 'handleProtocolMessage',
    value: function handleProtocolMessage(message) {
      var data = message.data;

      var buffer = new Buffer(data, 'binary');
      var rawMessage = JSON.parse(buffer.toString('utf-8'));
      var requestId = rawMessage.requestId;
      var _rawMessage$status = rawMessage.status;
      var statusCode = _rawMessage$status.code;
      var statusMessage = _rawMessage$status.message;
      var messageStream = this.commands[requestId].messageStream;


      switch (statusCode) {
        case 200:
          // SUCCESS
          delete this.commands[requestId]; // TODO: optimize performance
          messageStream.push(rawMessage);
          messageStream.push(null);
          break;
        case 204:
          // NO_CONTENT
          delete this.commands[requestId];
          messageStream.push(null);
          break;
        case 206:
          // PARTIAL_CONTENT
          messageStream.push(rawMessage);
          break;
        default:
          delete this.commands[requestId];
          messageStream.emit('error', new Error(statusMessage + ' (Error ' + statusCode + ')'));
          break;
      }
    }

    /**
     * Handle the WebSocket onOpen event, flag the client as connected and
     * process command queue.
     */

  }, {
    key: 'onConnectionOpen',
    value: function onConnectionOpen() {
      this.connected = true;
      this.emit('connect');

      this.executeQueue();
    }
  }, {
    key: 'handleDisconnection',


    /**
     * @param {CloseEvent} event
     */
    value: function handleDisconnection(event) {
      this.cancelPendingCommands({
        message: 'WebSocket closed',
        details: event
      });
    }
  }, {
    key: 'executeQueue',


    /**
     * Process the current command queue, sending commands to Gremlin Server
     * (First In, First Out).
     */
    value: function executeQueue() {
      while (this.queue.length > 0) {
        var _queue$shift = this.queue.shift();

        var message = _queue$shift.message;

        this.sendMessage(message);
      }
    }
  }, {
    key: 'cancelPendingCommands',


    /**
     * @param {Object} reason
     */
    value: function cancelPendingCommands(_ref2) {
      var message = _ref2.message;
      var details = _ref2.details;

      var commands = this.commands;
      var command = void 0;
      var error = new Error(message);
      error.details = details;

      // Empty queue
      this.queue.length = 0;
      this.commands = {};

      Object.keys(commands).forEach(function (key) {
        command = commands[key];
        command.messageStream.emit('error', error);
      });
    }
  }, {
    key: 'buildMessage',


    /**
     * For a given script string and optional bound parameters, build a protocol
     * message object to be sent to Gremlin Server.
     *
     * @param {String|Function} script
     * @param {Object} bindings
     * @param {Object} message
     */
    value: function buildMessage(rawScript) {
      var rawBindings = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var baseMessage = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _Utils$buildQueryFrom = Utils.buildQueryFromSignature(rawScript, rawBindings);

      var gremlin = _Utils$buildQueryFrom.gremlin;
      var bindings = _Utils$buildQueryFrom.bindings;
      var _options = this.options;
      var processor = _options.processor;
      var op = _options.op;
      var accept = _options.accept;
      var language = _options.language;


      var baseArgs = { gremlin: gremlin, bindings: bindings, accept: accept, language: language };
      var args = _lodash2.default.defaults(baseMessage.args || {}, baseArgs);

      var message = _extends({
        requestId: _nodeUuid2.default.v1(),
        processor: processor,
        op: op,
        args: args
      }, baseMessage);

      if (this.useSession) {
        // Assume that people want to use the 'session' processor unless specified
        message.processor = message.processor || processor || 'session';
        message.args.session = this.sessionId;
      }

      return message;
    }
  }, {
    key: 'sendMessage',
    value: function sendMessage(message) {
      var serializedMessage = this.options.accept + JSON.stringify(message);

      // Let's start packing the message into binary
      // mimeLength(1) + mimeType Length + serializedMessage Length
      var binaryMessage = new Uint8Array(1 + serializedMessage.length);
      binaryMessage[0] = this.options.accept.length;

      for (var i = 0; i < serializedMessage.length; i++) {
        binaryMessage[i + 1] = serializedMessage.charCodeAt(i);
      }

      this.connection.sendMessage(binaryMessage);
    }
  }, {
    key: 'execute',


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
    value: function execute(script) {
      var bindings = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var message = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var callback = arguments.length <= arguments.length - 3 - 1 + 3 ? undefined : arguments[arguments.length - 3 - 1 + 3];

      if (typeof message === 'function') {
        callback = message;
        message = {};
      }

      var messageStream = this.messageStream(script, bindings, message);

      // TO CHECK: errors handling could be improved
      // See https://groups.google.com/d/msg/nodejs/lJYT9hZxFu0/L59CFbqWGyYJ
      // for an example using domains
      var executeHandler = this.options.executeHandler;


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

  }, {
    key: 'stream',
    value: function stream(script, bindings, message) {
      var messageStream = this.messageStream(script, bindings, message);
      var _ = _highland2.default; // override lo-dash locally

      // Create a local highland 'through' pipeline so we don't expose
      // a Highland stream to the end user, but a standard Node.js Stream2
      var through = _.pipeline(_.map(function (_ref3) {
        var data = _ref3.result.data;
        return data;
      }), _.sequence());

      var rawStream = messageStream.pipe(through);

      messageStream.on('error', function (e) {
        rawStream.emit('error', new Error(e));
      });

      return rawStream;
    }
  }, {
    key: 'messageStream',


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
    value: function messageStream(script, bindings, rawMessage) {
      var stream = new _MessageStream2.default({ objectMode: true });

      var command = {
        message: this.buildMessage(script, bindings, rawMessage),
        messageStream: stream
      };

      this.sendCommand(command); //todo improve for streams

      return stream;
    }
  }, {
    key: 'sendCommand',


    /**
     * Send a command to Gremlin Server, or add it to queue if the connection
     * is not established.
     *
     * @param {Object} command
     */
    value: function sendCommand(command) {
      var message = command.message;
      var requestId = command.message.requestId;


      this.commands[requestId] = command;

      if (this.connected) {
        this.sendMessage(message);
      } else {
        this.queue.push(command);
      }
    }
  }]);

  return GremlinClient;
}(_events.EventEmitter);

exports.default = GremlinClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9HcmVtbGluQ2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFFQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWTs7Ozs7Ozs7Ozs7Ozs7SUFHTjs7O0FBQ0osV0FESSxhQUNKLEdBQTJEO1FBQS9DLDZEQUFPLG9CQUF3QztRQUFsQyw2REFBTywyQkFBMkI7UUFBZCxnRUFBVSxrQkFBSTs7MEJBRHZELGVBQ3VEOzt1RUFEdkQsMkJBQ3VEOztBQUd6RCxVQUFLLElBQUwsR0FBWSxJQUFaLENBSHlEO0FBSXpELFVBQUssSUFBTCxHQUFZLElBQVosQ0FKeUQ7O3dCQU1uQyxRQUFkLEtBTmlEO1FBTWpELHFDQUFPLG1CQU4wQzs7O0FBUXpELFVBQUssT0FBTDtBQUNFLGdCQUFVLGdCQUFWO0FBQ0EsZUFBUyxLQUFUO0FBQ0EsVUFBSSxNQUFKO0FBQ0EsaUJBQVcsRUFBWDtBQUNBLGNBQVEsa0JBQVI7QUFDQSxXQUFLLEtBQUw7QUFDQTtPQUNHO0FBQ0gsWUFBTSxLQUFLLE1BQUwsSUFBZSxDQUFDLEtBQUssVUFBTCxDQUFnQixHQUFoQixDQUFELFNBQTRCLElBQTNDLEdBQW9ELElBQXBEO01BVFIsQ0FSeUQ7O0FBb0J6RCxVQUFLLFVBQUwsR0FBa0IsTUFBSyxPQUFMLENBQWEsT0FBYixDQXBCdUM7O0FBc0J6RCxRQUFJLE1BQUssVUFBTCxFQUFpQjtBQUNuQixZQUFLLFNBQUwsR0FBaUIsbUJBQUssRUFBTCxFQUFqQixDQURtQjtLQUFyQjs7QUFJQSxVQUFLLFNBQUwsR0FBaUIsS0FBakIsQ0ExQnlEO0FBMkJ6RCxVQUFLLEtBQUwsR0FBYSxFQUFiLENBM0J5RDs7QUE2QnpELFVBQUssUUFBTCxHQUFnQixFQUFoQixDQTdCeUQ7O0FBK0J6RCxVQUFLLFVBQUwsR0FBa0IsTUFBSyxnQkFBTCxDQUFzQjtBQUN0QyxnQkFEc0M7QUFFdEMsZ0JBRnNDO0FBR3RD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SUFBWCxDQUFnQixPQUFoQixFQURLO09BRlA7Ozs7U0FoVEU7OztrQkF3VFMiLCJmaWxlIjoiR3JlbWxpbkNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qanNsaW50IC1XMDc5ICovXG4vKmpzbGludCBub2RlOiB0cnVlICovXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuXG5pbXBvcnQgdXVpZCBmcm9tICdub2RlLXV1aWQnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBoaWdobGFuZCBmcm9tICdoaWdobGFuZCc7XG5cbmltcG9ydCBXZWJTb2NrZXRHcmVtbGluQ29ubmVjdGlvbiBmcm9tICcuL1dlYlNvY2tldEdyZW1saW5Db25uZWN0aW9uJztcbmltcG9ydCBNZXNzYWdlU3RyZWFtIGZyb20gJy4vTWVzc2FnZVN0cmVhbSc7XG5pbXBvcnQgZXhlY3V0ZUhhbmRsZXIgZnJvbSAnLi9leGVjdXRlSGFuZGxlcic7XG5pbXBvcnQgKiBhcyBVdGlscyBmcm9tICcuL3V0aWxzJztcblxuXG5jbGFzcyBHcmVtbGluQ2xpZW50IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IocG9ydCA9IDgxODIsIGhvc3QgPSAnbG9jYWxob3N0Jywgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMucG9ydCA9IHBvcnQ7XG4gICAgdGhpcy5ob3N0ID0gaG9zdDtcblxuICAgIGNvbnN0IHsgcGF0aCA9ICcnIH0gPSBvcHRpb25zO1xuXG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgbGFuZ3VhZ2U6ICdncmVtbGluLWdyb292eScsXG4gICAgICBzZXNzaW9uOiBmYWxzZSxcbiAgICAgIG9wOiAnZXZhbCcsXG4gICAgICBwcm9jZXNzb3I6ICcnLFxuICAgICAgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB0bHM6IGZhbHNlLFxuICAgICAgZXhlY3V0ZUhhbmRsZXIsXG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgcGF0aDogcGF0aC5sZW5ndGggJiYgIXBhdGguc3RhcnRzV2l0aCgnLycpID8gYC8ke3BhdGh9YCA6IHBhdGhcbiAgICB9XG5cbiAgICB0aGlzLnVzZVNlc3Npb24gPSB0aGlzLm9wdGlvbnMuc2Vzc2lvbjtcblxuICAgIGlmICh0aGlzLnVzZVNlc3Npb24pIHtcbiAgICAgIHRoaXMuc2Vzc2lvbklkID0gdXVpZC52MSgpO1xuICAgIH1cblxuICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuXG4gICAgdGhpcy5jb21tYW5kcyA9IHt9O1xuXG4gICAgdGhpcy5jb25uZWN0aW9uID0gdGhpcy5jcmVhdGVDb25uZWN0aW9uKHtcbiAgICAgIHBvcnQsXG4gICAgICBob3N0LFxuICAgICAgcGF0aDogdGhpcy5vcHRpb25zLnBhdGgsXG4gICAgICB0bHM6IHRoaXMub3B0aW9ucy50bHNcbiAgICB9KTtcbiAgfVxuXG4gIGNyZWF0ZUNvbm5lY3Rpb24oeyBwb3J0LCBob3N0LCBwYXRoLCB0bHMgfSkge1xuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBuZXcgV2ViU29ja2V0R3JlbWxpbkNvbm5lY3Rpb24oeyBwb3J0LCBob3N0LCBwYXRoLCB0bHMgfSk7XG5cbiAgICBjb25uZWN0aW9uLm9uKCdvcGVuJywgKCkgPT4gdGhpcy5vbkNvbm5lY3Rpb25PcGVuKCkpO1xuICAgIGNvbm5lY3Rpb24ub24oJ2Vycm9yJywgKGVycm9yKSA9PiB0aGlzLmhhbmRsZUVycm9yKGVycm9yKSk7XG4gICAgY29ubmVjdGlvbi5vbignbWVzc2FnZScsIChtZXNzYWdlKSA9PiB0aGlzLmhhbmRsZVByb3RvY29sTWVzc2FnZShtZXNzYWdlKSk7XG4gICAgY29ubmVjdGlvbi5vbignY2xvc2UnLCAoZXZlbnQpID0+IHRoaXMuaGFuZGxlRGlzY29ubmVjdGlvbihldmVudCkpXG5cbiAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgfVxuXG4gIGhhbmRsZUVycm9yKGVycikge1xuICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyBhbGwgaW5jb21pbmcgcmF3IG1lc3NhZ2UgZXZlbnRzIHNlbnQgYnkgR3JlbWxpbiBTZXJ2ZXIsIGFuZCBkaXNwYXRjaFxuICAgKiB0byB0aGUgYXBwcm9wcmlhdGUgY29tbWFuZC5cbiAgICpcbiAgICogQHBhcmFtIHtNZXNzYWdlRXZlbnR9IGV2ZW50XG4gICAqL1xuICBoYW5kbGVQcm90b2NvbE1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGNvbnN0IHsgZGF0YSB9ID0gbWVzc2FnZTtcbiAgICBjb25zdCBidWZmZXIgPSBuZXcgQnVmZmVyKGRhdGEsICdiaW5hcnknKTtcbiAgICBjb25zdCByYXdNZXNzYWdlID0gSlNPTi5wYXJzZShidWZmZXIudG9TdHJpbmcoJ3V0Zi04JykpO1xuICAgIGNvbnN0IHtcbiAgICAgIHJlcXVlc3RJZCxcbiAgICAgIHN0YXR1czrCoHtcbiAgICAgICAgY29kZTogc3RhdHVzQ29kZSxcbiAgICAgICAgbWVzc2FnZTogc3RhdHVzTWVzc2FnZVxuICAgICAgfVxuICAgIH0gPSByYXdNZXNzYWdlO1xuXG4gICAgY29uc3QgeyBtZXNzYWdlU3RyZWFtIH0gPSB0aGlzLmNvbW1hbmRzW3JlcXVlc3RJZF07XG5cbiAgICBzd2l0Y2ggKHN0YXR1c0NvZGUpIHtcbiAgICAgIGNhc2UgMjAwOiAvLyBTVUNDRVNTXG4gICAgICAgIGRlbGV0ZSB0aGlzLmNvbW1hbmRzW3JlcXVlc3RJZF07IC8vIFRPRE86IG9wdGltaXplIHBlcmZvcm1hbmNlXG4gICAgICAgIG1lc3NhZ2VTdHJlYW0ucHVzaChyYXdNZXNzYWdlKTtcbiAgICAgICAgbWVzc2FnZVN0cmVhbS5wdXNoKG51bGwpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjA0OiAvLyBOT19DT05URU5UXG4gICAgICAgIGRlbGV0ZSB0aGlzLmNvbW1hbmRzW3JlcXVlc3RJZF07XG4gICAgICAgIG1lc3NhZ2VTdHJlYW0ucHVzaChudWxsKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDIwNjogLy8gUEFSVElBTF9DT05URU5UXG4gICAgICAgIG1lc3NhZ2VTdHJlYW0ucHVzaChyYXdNZXNzYWdlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkZWxldGUgdGhpcy5jb21tYW5kc1tyZXF1ZXN0SWRdO1xuICAgICAgICBtZXNzYWdlU3RyZWFtLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKHN0YXR1c01lc3NhZ2UgKyAnIChFcnJvciAnKyBzdGF0dXNDb2RlICsnKScpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0aGUgV2ViU29ja2V0IG9uT3BlbiBldmVudCwgZmxhZyB0aGUgY2xpZW50IGFzIGNvbm5lY3RlZCBhbmRcbiAgICogcHJvY2VzcyBjb21tYW5kIHF1ZXVlLlxuICAgKi9cbiAgb25Db25uZWN0aW9uT3BlbigpIHtcbiAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgdGhpcy5lbWl0KCdjb25uZWN0Jyk7XG5cbiAgICB0aGlzLmV4ZWN1dGVRdWV1ZSgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0Nsb3NlRXZlbnR9IGV2ZW50XG4gICAqL1xuICBoYW5kbGVEaXNjb25uZWN0aW9uKGV2ZW50KSB7XG4gICAgdGhpcy5jYW5jZWxQZW5kaW5nQ29tbWFuZHMoe1xuICAgICAgbWVzc2FnZTogJ1dlYlNvY2tldCBjbG9zZWQnLFxuICAgICAgZGV0YWlsczogZXZlbnRcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogUHJvY2VzcyB0aGUgY3VycmVudCBjb21tYW5kIHF1ZXVlLCBzZW5kaW5nIGNvbW1hbmRzIHRvIEdyZW1saW4gU2VydmVyXG4gICAqIChGaXJzdCBJbiwgRmlyc3QgT3V0KS5cbiAgICovXG4gIGV4ZWN1dGVRdWV1ZSgpIHtcbiAgICB3aGlsZSAodGhpcy5xdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICBsZXQgeyBtZXNzYWdlIH0gPSB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG4gICAgICB0aGlzLnNlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IHJlYXNvblxuICAgKi9cbiAgY2FuY2VsUGVuZGluZ0NvbW1hbmRzKHsgbWVzc2FnZSwgZGV0YWlscyB9KSB7XG4gICAgY29uc3QgY29tbWFuZHMgPSB0aGlzLmNvbW1hbmRzO1xuICAgIGxldCBjb21tYW5kO1xuICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIGVycm9yLmRldGFpbHMgPSBkZXRhaWxzO1xuXG4gICAgLy8gRW1wdHkgcXVldWVcbiAgICB0aGlzLnF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5jb21tYW5kcyA9IHt9O1xuXG4gICAgT2JqZWN0LmtleXMoY29tbWFuZHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgY29tbWFuZCA9IGNvbW1hbmRzW2tleV07XG4gICAgICBjb21tYW5kLm1lc3NhZ2VTdHJlYW0uZW1pdCgnZXJyb3InLCBlcnJvcik7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEZvciBhIGdpdmVuIHNjcmlwdCBzdHJpbmcgYW5kIG9wdGlvbmFsIGJvdW5kIHBhcmFtZXRlcnMsIGJ1aWxkIGEgcHJvdG9jb2xcbiAgICogbWVzc2FnZSBvYmplY3QgdG8gYmUgc2VudCB0byBHcmVtbGluIFNlcnZlci5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHNjcmlwdFxuICAgKiBAcGFyYW0ge09iamVjdH0gYmluZGluZ3NcbiAgICogQHBhcmFtIHtPYmplY3R9IG1lc3NhZ2VcbiAgICovXG4gIGJ1aWxkTWVzc2FnZShyYXdTY3JpcHQsIHJhd0JpbmRpbmdzID0ge30sIGJhc2VNZXNzYWdlID0ge30pIHtcbiAgICBsZXQgeyBncmVtbGluLCBiaW5kaW5ncyB9ID0gVXRpbHMuYnVpbGRRdWVyeUZyb21TaWduYXR1cmUocmF3U2NyaXB0LCByYXdCaW5kaW5ncyk7XG4gICAgY29uc3QgeyBwcm9jZXNzb3IsIG9wLCBhY2NlcHQsIGxhbmd1YWdlIH0gPSB0aGlzLm9wdGlvbnM7XG5cbiAgICBjb25zdCBiYXNlQXJncyA9IHsgZ3JlbWxpbiwgYmluZGluZ3MsIGFjY2VwdCwgbGFuZ3VhZ2UgfTtcbiAgICBjb25zdCBhcmdzID0gXy5kZWZhdWx0cyhiYXNlTWVzc2FnZS5hcmdzIHx8IHt9LCBiYXNlQXJncyk7XG5cbiAgICBjb25zdCBtZXNzYWdlID0ge1xuICAgICAgcmVxdWVzdElkOiB1dWlkLnYxKCksXG4gICAgICBwcm9jZXNzb3IsXG4gICAgICBvcCxcbiAgICAgIGFyZ3MsXG4gICAgICAuLi5iYXNlTWVzc2FnZVxuICAgIH07XG5cbiAgICBpZiAodGhpcy51c2VTZXNzaW9uKSB7XG4gICAgICAvLyBBc3N1bWUgdGhhdCBwZW9wbGUgd2FudCB0byB1c2UgdGhlICdzZXNzaW9uJyBwcm9jZXNzb3IgdW5sZXNzIHNwZWNpZmllZFxuICAgICAgbWVzc2FnZS5wcm9jZXNzb3IgPSBtZXNzYWdlLnByb2Nlc3NvciB8fCBwcm9jZXNzb3IgfHwgJ3Nlc3Npb24nO1xuICAgICAgbWVzc2FnZS5hcmdzLnNlc3Npb24gPSB0aGlzLnNlc3Npb25JZDtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVzc2FnZTtcbiAgfTtcblxuICBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgY29uc3Qgc2VyaWFsaXplZE1lc3NhZ2UgPSB0aGlzLm9wdGlvbnMuYWNjZXB0ICsgSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG5cbiAgICAvLyBMZXQncyBzdGFydCBwYWNraW5nIHRoZSBtZXNzYWdlIGludG8gYmluYXJ5XG4gICAgLy8gbWltZUxlbmd0aCgxKSArIG1pbWVUeXBlIExlbmd0aCArIHNlcmlhbGl6ZWRNZXNzYWdlIExlbmd0aFxuICAgIGxldCBiaW5hcnlNZXNzYWdlID0gbmV3IFVpbnQ4QXJyYXkoMSArIHNlcmlhbGl6ZWRNZXNzYWdlLmxlbmd0aCk7XG4gICAgYmluYXJ5TWVzc2FnZVswXSA9IHRoaXMub3B0aW9ucy5hY2NlcHQubGVuZ3RoO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZXJpYWxpemVkTWVzc2FnZS5sZW5ndGg7IGkrKykge1xuICAgICAgYmluYXJ5TWVzc2FnZVtpICsgMV0gPSBzZXJpYWxpemVkTWVzc2FnZS5jaGFyQ29kZUF0KGkpO1xuICAgIH1cblxuICAgIHRoaXMuY29ubmVjdGlvbi5zZW5kTWVzc2FnZShiaW5hcnlNZXNzYWdlKTtcbiAgfTtcblxuICAvKipcbiAgICogQXN5bmNocm9ub3VzbHkgc2VuZCBhIHNjcmlwdCB0byBHcmVtbGluIFNlcnZlciBmb3IgZXhlY3V0aW9uIGFuZCBmaXJlXG4gICAqIHRoZSBwcm92aWRlZCBjYWxsYmFjayB3aGVuIGFsbCByZXN1bHRzIGhhdmUgYmVlbiBmZXRjaGVkLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpbnRlcm5hbGx5IHVzZXMgYSBzdHJlYW0gdG8gaGFuZGxlIHRoZSBwb3RlbnRpYWwgY29uY2F0ZW5hdGlvblxuICAgKiBvZiByZXN1bHRzLlxuICAgKlxuICAgKiBDYWxsYmFjayBzaWduYXR1cmU6IChFcnJvciwgQXJyYXk8cmVzdWx0PilcbiAgICpcbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gc2NyaXB0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBiaW5kaW5nc1xuICAgKiBAcGFyYW0ge09iamVjdH0gbWVzc2FnZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgKi9cbiAgZXhlY3V0ZShzY3JpcHQsIGJpbmRpbmdzID0ge30sIG1lc3NhZ2UgPSB7fSwgLi4uYXJncykge1xuICAgIGxldCBjYWxsYmFjayA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcblxuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBtZXNzYWdlO1xuICAgICAgbWVzc2FnZSA9IHt9O1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2VTdHJlYW0gPSB0aGlzLm1lc3NhZ2VTdHJlYW0oc2NyaXB0LCBiaW5kaW5ncywgbWVzc2FnZSk7XG5cbiAgICAvLyBUTyBDSEVDSzogZXJyb3JzIGhhbmRsaW5nIGNvdWxkIGJlIGltcHJvdmVkXG4gICAgLy8gU2VlIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZC9tc2cvbm9kZWpzL2xKWVQ5aFp4RnUwL0w1OUNGYnFXR3lZSlxuICAgIC8vIGZvciBhbiBleGFtcGxlIHVzaW5nIGRvbWFpbnNcbiAgICBjb25zdCB7IGV4ZWN1dGVIYW5kbGVyIH0gPSB0aGlzLm9wdGlvbnM7XG5cbiAgICBleGVjdXRlSGFuZGxlcihtZXNzYWdlU3RyZWFtLCBjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZSB0aGUgc2NyaXB0IGFuZCByZXR1cm4gYSBzdHJlYW0gb2YgZGlzdGluY3Qvc2luZ2xlIHJlc3VsdHMuXG4gICAqIFRoaXMgbWV0aG9kIHJlZW1pdHMgYSBkaXN0aW5jdCBkYXRhIGV2ZW50IGZvciBlYWNoIHJldHVybmVkIHJlc3VsdCwgd2hpY2hcbiAgICogbWFrZXMgdGhlIHN0cmVhbSBiZWhhdmUgYXMgaWYgYHJlc3VsdEl0ZXJhdGlvbkJhdGNoU2l6ZWAgd2FzIHNldCB0byAxLlxuICAgKlxuICAgKiBJZiB5b3UgZG8gbm90IHdpc2ggdGhpcyBiZWhhdmlvciwgcGxlYXNlIHVzZSBjbGllbnQubWVzc2FnZVN0cmVhbSgpIGluc3RlYWQuXG4gICAqXG4gICAqIEV2ZW4gdGhvdWdoIHRoaXMgbWV0aG9kIHVzZXMgSGlnaGxhbmQuanMgaW50ZXJuYWxseSwgaXQgZG9lcyBub3QgcmV0dXJuXG4gICAqIGEgaGlnaCBsZXZlbCBIaWdobGFuZCByZWFkYWJsZSBzdHJlYW0gc28gd2UgZG8gbm90IHJpc2sgaGF2aW5nIHRvIGRlYWxcbiAgICogd2l0aCB1bmV4cGVjdGVkIEFQSSBicmVha2luZyBjaGFuZ2VzIGFzIEhpZ2hsYW5kLmpzIGV2b2x2ZXMuXG4gICAqXG4gICAqIEByZXR1cm4ge1JlYWRhYmxlU3RyZWFtfSBBIE5vZGUuanMgU3RyZWFtMlxuICAgKi9cbiAgc3RyZWFtKHNjcmlwdCwgYmluZGluZ3MsIG1lc3NhZ2UpIHtcbiAgICBjb25zdCBtZXNzYWdlU3RyZWFtID0gdGhpcy5tZXNzYWdlU3RyZWFtKHNjcmlwdCwgYmluZGluZ3MsIG1lc3NhZ2UpO1xuICAgIGNvbnN0IF8gPSBoaWdobGFuZDsgLy8gb3ZlcnJpZGUgbG8tZGFzaCBsb2NhbGx5XG5cbiAgICAvLyBDcmVhdGUgYSBsb2NhbCBoaWdobGFuZCAndGhyb3VnaCcgcGlwZWxpbmUgc28gd2UgZG9uJ3QgZXhwb3NlXG4gICAgLy8gYSBIaWdobGFuZCBzdHJlYW0gdG8gdGhlIGVuZCB1c2VyLCBidXQgYSBzdGFuZGFyZCBOb2RlLmpzIFN0cmVhbTJcbiAgICBjb25zdCB0aHJvdWdoID0gXy5waXBlbGluZShcbiAgICAgIF8ubWFwKCh7IHJlc3VsdDogeyBkYXRhIH19KSA9PiBkYXRhKSxcbiAgICAgIF8uc2VxdWVuY2UoKVxuICAgICk7XG5cbiAgICBsZXQgcmF3U3RyZWFtID0gbWVzc2FnZVN0cmVhbS5waXBlKHRocm91Z2gpO1xuXG4gICAgbWVzc2FnZVN0cmVhbS5vbignZXJyb3InLCAoZSkgPT4ge1xuICAgICAgcmF3U3RyZWFtLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKGUpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiByYXdTdHJlYW07XG4gIH07XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgdGhlIHNjcmlwdCBhbmQgcmV0dXJuIGEgc3RyZWFtIG9mIHJhdyBtZXNzYWdlcyByZXR1cm5lZCBieSBHcmVtbGluXG4gICAqIFNlcnZlci5cbiAgICogVGhpcyBtZXRob2QgZG9lcyBub3QgcmVlbWl0IG9uZSBkaXN0aW5jdCBkYXRhIGV2ZW50IHBlciByZXN1bHQuIEl0IGRpcmVjdGx5XG4gICAqIGVtaXRzIHRoZSByYXcgbWVzc2FnZXMgcmV0dXJuZWQgYnkgR3JlbWxpbiBTZXJ2ZXIgYXMgdGhleSBhcmUgcmVjZWl2ZWQuXG4gICAqXG4gICAqIEFsdGhvdWdoIHB1YmxpYywgdGhpcyBpcyBhIGxvdyBsZXZlbCBtZXRob2QgaW50ZW5kZWQgdG8gYmUgdXNlZCBmb3JcbiAgICogYWR2YW5jZWQgdXNhZ2VzLlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBzY3JpcHRcbiAgICogQHBhcmFtIHtPYmplY3R9IGJpbmRpbmdzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtZXNzYWdlXG4gICAqIEByZXR1cm4ge01lc3NhZ2VTdHJlYW19XG4gICAqL1xuICBtZXNzYWdlU3RyZWFtKHNjcmlwdCwgYmluZGluZ3MsIHJhd01lc3NhZ2UpIHtcbiAgICBsZXQgc3RyZWFtID0gbmV3IE1lc3NhZ2VTdHJlYW0oeyBvYmplY3RNb2RlOiB0cnVlIH0pO1xuXG4gICAgY29uc3QgY29tbWFuZCA9IHtcbiAgICAgIG1lc3NhZ2U6IHRoaXMuYnVpbGRNZXNzYWdlKHNjcmlwdCwgYmluZGluZ3MsIHJhd01lc3NhZ2UpLFxuICAgICAgbWVzc2FnZVN0cmVhbTogc3RyZWFtXG4gICAgfTtcblxuICAgIHRoaXMuc2VuZENvbW1hbmQoY29tbWFuZCk7IC8vdG9kbyBpbXByb3ZlIGZvciBzdHJlYW1zXG5cbiAgICByZXR1cm4gc3RyZWFtO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kIGEgY29tbWFuZCB0byBHcmVtbGluIFNlcnZlciwgb3IgYWRkIGl0IHRvIHF1ZXVlIGlmIHRoZSBjb25uZWN0aW9uXG4gICAqIGlzIG5vdCBlc3RhYmxpc2hlZC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbW1hbmRcbiAgICovXG4gIHNlbmRDb21tYW5kKGNvbW1hbmQpIHtcbiAgICBjb25zdCB7XG4gICAgICBtZXNzYWdlLFxuICAgICAgbWVzc2FnZToge1xuICAgICAgICByZXF1ZXN0SWRcbiAgICAgIH1cbiAgICB9ID0gY29tbWFuZDtcblxuICAgIHRoaXMuY29tbWFuZHNbcmVxdWVzdElkXSA9IGNvbW1hbmQ7XG5cbiAgICBpZiAodGhpcy5jb25uZWN0ZWQpIHtcbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucXVldWUucHVzaChjb21tYW5kKTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyZW1saW5DbGllbnQ7XG4iXX0=