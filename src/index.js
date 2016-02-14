import GremlinClient from './GremlinClient';


export function createClient(port, host, options) {
  if (typeof port === 'object') {
    options = port;
    port = undefined;
  }

  if (typeof host === 'object') {
    options = host;
    host = undefined;
  }

  return new GremlinClient(port, host, options);
};


export default {
  createClient
}