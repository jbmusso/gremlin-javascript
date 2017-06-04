import ReadableStream from 'readable-stream';

class MessageStream extends ReadableStream {
  constructor(...args) {
    super(...args);
  }

  _read() {
    this._paused = false;
  }
}

export default MessageStream;
