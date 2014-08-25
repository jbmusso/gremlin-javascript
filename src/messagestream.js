var inherits = require('util').inherits;
var ReadableStream = require('readable-stream');


function MessageStream() {
  ReadableStream.apply(this, arguments);
}

inherits(MessageStream, ReadableStream);

MessageStream.prototype._read = function() {
  this._paused = false;
};


module.exports = MessageStream;