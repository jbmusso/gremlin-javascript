import _ from 'lodash';
import template from 'gremlin-template-string';
export { gremlin as statics } from 'zer';

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
}

/**
 * Given a query object, returns a Promise of executing that query with a
 * given client.
 * @param  {GremlinClient} client Gremlin client to execute queries with
 * @param  {Object} query  A query Object { gremlin: String, bindings: Object }
 * @return {Promise} Promise of execution of the query
 */
const makePromise = (client, query) => {
  const promise = new Promise((resolve, reject) =>
    client.execute(
      query,
      (err, results) => (err ? reject(err) : resolve(results)),
    ),
  );
  // Let's attach the query for easier debugging
  promise.query = query;

  return promise;
};

export const makeTemplateTag = client => (...gremlinChunks) =>
  makePromise(client, template(...gremlinChunks));

/**
 * Given a map of functions returning query objects, returns a map
 * of function promising execution of these queries with the given Gremlin
 * client.
 *
 * @param  {GremlinClient} client Gremlin client to execute queries with
 * @param  {Object<String, Function<Object>>} functions
 * @return {Object<String, Function<Promise<Results>>>}
 */
export const bindForClient = (client, functions) =>
  _(functions)
    .mapValues(fn => (...args) => makePromise(client, fn(...args)))
    .value();

export default {
  createClient,
  makeTemplateTag,
  bindForClient,
};
