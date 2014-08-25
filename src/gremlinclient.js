/*jslint -W079 */
/*jslint node: true */
'use strict';
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

var WebSocket = require('ws');
var Guid = require('guid');
var _ = {
  defaults: require('lodash.defaults')
};
var highland = require('highland');

var MessageStream = require('./messagestream');

function GremlinClient(port, host, options) {
  this.port = port || 8182;
  this.host = host || 'localhost';

  this.options = _.defaults(options || {}, {
    language: 'gremlin-groovy',
    session: false,
    op: 'eval',
    processor: '',
    accept: 'application/json'
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
    console.log('Error:', e);
  };

  this.ws.onmessage = this.handleMessage.bind(this);

  this.ws.onclose = this.handleDisconnection.bind(this);
}

inherits(GremlinClient, EventEmitter);

/**
 * Process all incoming raw message events sent by Gremlin Server, and dispatch
 * to the appropriate command.
 *
 * @param {MessageEvent} event
 */
GremlinClient.prototype.handleMessage = function(event) {
  var message = JSON.parse(event.data || event); // Node.js || Browser API
  var command = this.commands[message.requestId];
  var stream = command.stream;

  switch (message.code) {
    case 200:
      stream.push(message);
      break;
    case 299:
      message.result = command.result;
      delete this.commands[message.requestId]; // TODO: optimize performance
      stream.push(null);
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
    this.sendMessage(command.message);
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
    command.stream.emit('error', error);
  });
};

/**
 * For a given script string and optional bound parameters, build a command
 * object to be sent to Gremlin Server.
 *
 * @param {String} script
 * @param {Object} bindings
 * @param {Object} message
 * @param {Object} handlers
 */
GremlinClient.prototype.buildCommand = function(script, bindings, message) {
  if (typeof script === 'function') {
    script = this.extractFunctionBody(script);
  }
  bindings = bindings || {};

  var stream = new MessageStream({ objectMode: true });
  var guid = Guid.create().value;
  var args = _.defaults(message && message.args || {}, {
    gremlin: script,
    bindings: bindings,
    accept: this.options.accept,
    language: this.options.language,
  });

  message = _.defaults(message || {}, {
    requestId: guid,
    processor: this.options.processor,
    op: this.options.op,
    args: args
  });

  var command = {
    message: message,
    stream: stream
  };

  if (this.useSession) {
    command.message.processor = 'session';
    command.message.args.session = this.sessionId;
  }

  this.sendCommand(command); //todo improve for streams

  return command;
};

GremlinClient.prototype.sendMessage = function(message) {
  this.ws.send(JSON.stringify(message));
};

/**
 * Get the inner function body from a function.toString() representation
 *
 * @param {Function}
 * @return {String}
 */
GremlinClient.prototype.extractFunctionBody = function(fn) {
  var body = fn.toString();
  body = body.substring(body.indexOf('{') + 1, body.lastIndexOf('}'));

  return body;
};

GremlinClient.prototype.execute = function(script, bindings, message, callback) {
  callback = arguments[arguments.length - 1]; //todo: improve?

  if (typeof message === 'function') {
    callback = message;
    message = {};
  }

  var stream = this.messageStream(script, bindings, message);
  var results = [];

  stream = highland(stream)
    .map(function(message) { return message.result; });

  stream.on('data', function(data) {
    results = results.concat(data);
  });

  stream.on('end', function() {
    callback(null, results);
  });

  stream.on('error', function(error) {
    callback(new Error('Stream error: ' + error));
  });
};

/**
 * Execute the script and return stream of distinct results.
 * This method reemits a distinct data event for each returned result.
 *
 * Return a HighlandStream with all of the library high level methods attached,
 * allowing the user to create a Node.js/Browser side pipeline and issue more
 * transformations if needed.
 *
 * @return {HighlandStream} a higher level readable stream
 */
GremlinClient.prototype.stream = function(script, bindings, message) {
  var messageStream = this.messageStream(script, bindings, message);
  var stream = highland(messageStream)
    .map(function(message) {
      return message.result;
    })
    .sequence(); // reemit each result as a distinct 'data' event

  return stream;
};

/**
 * Execute the script and return a stream of raw messages returned by Gremlin
 * Server.
 *
 * This is a low level method intended to be used for advanced usages.
 *
 * @return {MessageStream}
 */
GremlinClient.prototype.messageStream = function(script, bindings, message) {
  var command = this.buildCommand(script, bindings, message);

  return command.stream;
};

/**
 * Send a command to Gremlin Server, or add it to queue if the connection
 * is not established.
 *
 * @param {Object} command
 */
GremlinClient.prototype.sendCommand = function(command) {
  this.commands[command.message.requestId] = command;

  if (this.connected) {
    this.sendMessage(command.message);
  } else {
    this.queue.push(command);
  }
};

module.exports = GremlinClient;
