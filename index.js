/*jslint -W079 */
/*jslint node: true */
'use strict';
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var Stream = require('stream').Stream;

var WebSocket = require('ws');
var Guid = require('guid');


function GremlinClient(port, host) {
  this.port = port || 8182;
  this.host = host || 'localhost';

  this.connected = false;
  this.queue = [];

  this.commands = {};

  // Open websocket connection
  this.ws = new WebSocket('ws://'+ this.host +':'+ this.port);

  this.ws.onopen = this.onOpen.bind(this);

  this.ws.onerror = function(e) {
    console.log("Error:", e);
  };

  this.ws.onmessage = this.onMessage.bind(this);

  this.ws.onclose = this.onClose.bind(this);
}

inherits(GremlinClient, EventEmitter);

GremlinClient.prototype.onMessage = function(data, flags) {
  var message = JSON.parse(data.data || data);
  var command = this.commands[message.requestId];

  if (message.type === 0) {
    message.result = command.result;
    return command.onEnd(message);
  }

  if (message.type === 1) {
    command.onData(message);
  }
};

GremlinClient.prototype.onOpen = function() {
  this.connected = true;
  this.emit('connect');

  this.executeQueue();
};

GremlinClient.prototype.onClose = function(code) {
  console.log("WebSocket closed", code);
};

GremlinClient.prototype.executeQueue = function() {
  var command;

  while (this.queue.length > 0) {
    command = this.queue.shift();
    this.send_message(command);
  }
};

GremlinClient.prototype.queueCommand = function(job) {
  var guid = Guid.create().value;
  var command = {
    message: {
      requestId: guid,
      processor: "",
      op: "eval",
      args: {
        gremlin: job.script,
        accept: "application/json"
      }
    },
    onData: job.onData,
    onEnd: job.onEnd,
    result: []
  };

  this.commands[guid] = command;

  return command;
};

GremlinClient.prototype.send_message = function(command) {
  this.ws.send(JSON.stringify(command.message));
};

GremlinClient.prototype.execute = function(script, callback) {
  var command = this.queueCommand({
    script: script,
    onData: function(message) {
      this.result = this.result.concat(message.result);
    },
    onEnd: function(data) {
      return callback(null, data);
    }
  });

  if (this.connected) {
    this.send_message(command);
  } else {
    this.queue.push(command);
  }
};

GremlinClient.prototype.stream = function(script) {
  var stream = new Stream();

  var command = this.queueCommand({
    script: script,
    onData: function(data) {
      stream.emit('data', data);
      stream.emit('result', data.result, data);
    },
    onEnd: function(data) {
      stream.emit('end', data);
    }
  });

  if (this.connected) {
    this.send_message(command);
  } else {
    this.queue.push(command);
  }

  return stream;
};


module.exports.createClient = function (port, host) {
  return new GremlinClient();
};