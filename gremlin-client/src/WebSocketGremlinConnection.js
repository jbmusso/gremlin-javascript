import { EventEmitter } from 'events';

import WebSocket from 'ws';

export default class WebSocketGremlinConnection extends EventEmitter {
  constructor({ port, host, path, ssl, rejectUnauthorized }) {
    super();

    this.open = false;

    const address = `ws${ssl ? 's' : ''}://${host}:${port}${path}`;
    const options = {
      rejectUnauthorized,
    };

    this.ws = new WebSocket(address, null, options);

    this.ws.onopen = () => this.onOpen();
    this.ws.onerror = err => this.handleError(err);
    this.ws.onmessage = message => this.handleMessage(message);
    this.ws.onclose = event => this.onClose(event);
    this.ws.binaryType = 'arraybuffer';
  }

  onOpen() {
    this.open = true;
    this.emit('open');
  }

  handleError(err) {
    this.emit('error', err);
  }

  handleMessage(message) {
    this.emit('message', message);
  }

  close() {
    this.ws.terminate();
  }

  onClose(event) {
    this.open = false;
    this.emit('close', event);
  }

  sendMessage(message) {
    this.ws.send(message, { mask: true, binary: true }, err => {
      if (err) {
        this.handleError(err);
      }
    });
  }
}
