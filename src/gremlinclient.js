/*jslint -W079 */
/*jslint node: true */
'use strict';
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var Stream = require('stream').Stream;

var WebSocket = require('ws');
var Guid = require('guid');
var _ = {
  defaults: require('lodash.defaults')
};

function GremlinClient(port, host, options) {
  this.port = port || 8182;
  this.host = host || 'localhost';

  this.options = _.defaults(options || {}, {
    language: "gremlin-groovy",
    session: false
  });

  this.useSession = this.options.session;

  if (this.useSession) {
    this.sessionId = Guid.create().value;
  }

  this.connected = false;
  this.queue = [];

  this.commands = {};

  // Open websocket connection
  this.ws = new WebSocket('ws://'+ this.host +':'+ this.port);

  this.ws.onopen = this.onConnectionOpen.bind(this);

  this.ws.onerror = function(e) {
    console.log("Error:", e);
  };

  this.ws.onmessage = this.handleMessage.bind(this);

  this.ws.onclose = this.handleDisconnection.bind(this);
}

inherits(GremlinClient, EventEmitter);

/**
 * Process all incoming raw message events sent by Gremlin Server.
 *
 * @param {MessageEvent} event
 */
GremlinClient.prototype.handleMessage = function(event) {
  var message = JSON.parse(event.data || event); // Node.js || Browser API
  var command = this.commands[message.requestId];

  switch (message.code) {
    case 200:
      command.onData(message);
      break;
    case 299:
      message.result = command.result;
      delete this.commands[message.requestId]; // TODO: optimize performance
      command.onEnd(message);
      break;
  }
};

/**
 * Handle the WebSocket onOpen event, flag the client as connected and
 * process command queue.
 */
GremlinClient.prototype.onConnectionOpen = function() {
  this.connected = true;
  this.emit('connect');

  this.executeQueue();
};

/**
 * @param {CloseEvent} event
 */
GremlinClient.prototype.handleDisconnection = function(event) {
  this.cancelPendingCommands({
    message: 'WebSocket closed',
    details: event
  });
};

/**
 * Process the current command queue, sending commands to Gremlin Server
 * (First In, First Out).
 */
GremlinClient.prototype.executeQueue = function() {
  var command;

  while (this.queue.length > 0) {
    command = this.queue.shift();
    this.sendMessage(command);
  }
};

/**
 * @param {Object} reason
 */
GremlinClient.prototype.cancelPendingCommands = function(reason) {
  var commands = this.commands;
  var command;
  var error = new Error(reason.message);
  error.details = reason.details;

  // Empty queue
  this.queue.length = 0;
  this.commands = {};

  Object.keys(commands).forEach(function(key) {
    command = commands[key];
    command.terminate(error);
  });
};

/**
 * For a given script string and optional bound parameters, build a command
 * object to be sent to Gremlin Server.
 */
GremlinClient.prototype.buildCommand = function(script, bindings, handlers) {
  var guid = Guid.create().value;
  bindings = bindings || {};

  var command = {
    message: {
      requestId: guid,
      processor: "",
      op: "eval",
      args: {
        gremlin: script,
        bindings: bindings,
        accept: "application/json",
        language: this.options.language,
      }
    },
    onData: handlers.onData,
    onEnd: handlers.onEnd,
    terminate: handlers.terminate,
    result: []
  };

  if (this.useSession) {
    command.message.processor = "session";
    command.message.args.session = this.sessionId;
  }

  return command;
};

GremlinClient.prototype.sendMessage = function(command) {
  this.ws.send(JSON.stringify(command.message));
};

/**
 * Get the inner function body from a function.toString() representation
 *
 * @param {Function}
 * @return {String}
 */
GremlinClient.prototype.extractFunctionBody = function(fn) {
  var body = fn.toString();
  body = body.substring(body.indexOf("{") + 1, body.lastIndexOf("}"));

  return body;
};

GremlinClient.prototype.execute = function(script, bindings, callback) {
  if (typeof script === 'function') {
    script = this.extractFunctionBody(script);
  }

  if (typeof bindings === 'function') {
    callback = bindings;
  }

  var command = this.buildCommand(script, bindings, {
    onData: function(message) {
      this.result = this.result.concat(message.result);
    },
    onEnd: function(data) {
      return callback(null, data);
    },
    terminate: function(error) {
      return callback(error);
    }
  });

  this.sendCommand(command);
};

GremlinClient.prototype.stream = function(script, bindings) {
  if (typeof script === 'function') {
    script = this.extractFunctionBody(script);
  }

  var stream = new Stream();

  var command = this.buildCommand(script, bindings, {
    onData: function(data) {
      stream.emit('data', data);
      stream.emit('result', data.result, data);
    },
    onEnd: function(data) {
      stream.emit('end', data);
    },
    terminate: function(error) {
      stream.emit('error', error);
    }
  });

  this.sendCommand(command);

  return stream;
};

/**
 * Send a command to Gremlin Server, or add it to queue if the connection
 * is not established.
 *
 * @param {Object} command
 */
GremlinClient.prototype.sendCommand = function(command) {
  if (this.connected) {
    this.sendMessage(command);
  } else {
    this.commands[command.message.requestId] = command;
    this.queue.push(command);
  }
};

module.exports = GremlinClient;
