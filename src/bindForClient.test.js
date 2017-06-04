require('chai').should();

import { createClient, bindForClient } from './';
import { assert } from 'chai';

const getByName = name => ({
  gremlin: 'g.V().has("name", name)',
  bindings: {
    name,
  },
});

describe('.bindForClient()', () => {
  it('should return a map of bound functions', async done => {
    const client = createClient();
    const queries = bindForClient(client, { getByName });
    assert.isFunction(queries.getByName);

    const promise = queries.getByName('marko');
    assert.property(promise, 'query');

    const result = await promise;
    result.length.should.equal(1);
    done();
  });
});
