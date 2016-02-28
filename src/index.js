import GremlinClient from './GremlinClient';
import template from 'gremlin-template-string';


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

export const makeTemplateTag = (client) => (...gremlinChunks) => {
  const query = template(...gremlinChunks);
  const promise = new Promise((resolve, reject) =>
    client.execute(query, (err, results) =>
      err ? reject(err) : resolve(results)
    )
  );
  // Let's attach the query for easier debugging
  promise.query = query;

  return promise;
}

export default {
  createClient,
  makeTemplateTag
}
