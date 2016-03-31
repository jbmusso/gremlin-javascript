import { EventEmitter } from 'events';

import WebSocket from 'ws';


export default class WebSocketGremlinConnection extends EventEmitter {
  constructor({ port, host, path, tls }) {
    super();

    this.open = false;
    this.protocol = tls ? 'wss' : 'ws';
    this.ws = new WebSocket(this.protocol + `://${host}:${port}${path}`);

    this.ws.onopen = () => this.onOpen();
    this.ws.onerror = (err) => this.handleError(err);
    this.ws.onmessage = (message) => this.handleMessage(message);
    this.ws.onclose = (event) => this.onClose(event);
    this.ws.binaryType = "arraybuffer";
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

  onClose(event) {
    this.open = false;
    this.emit('close', event);
  }

  sendMessage(message) {
    this.ws.send(message, { mask: true, binary: true }, (err) => {
      if (err) {
        this.handleError(err);
      }
    });
  }
}
