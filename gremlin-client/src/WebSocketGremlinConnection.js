import { EventEmitter } from 'events';

import WebSocket from 'ws';
import Url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';

export default class WebSocketGremlinConnection extends EventEmitter {
  constructor({ port, host, path, ssl, rejectUnauthorized }) {
    super();

    this.open = false;

    const address = `ws${ssl ? 's' : ''}://${host}:${port}${path}`;
    const options = {
      rejectUnauthorized,
    };

    var proxy = process.env.http_proxy;
    var agent_options = null;
    var custom_agent = null;
    if (proxy) {
      agent_options = Url.parse(proxy);
      var agent = new HttpsProxyAgent(agent_options);
      custom_agent = { agent: agent };
    }
    this.ws = new WebSocket(address, custom_agent, options);

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
