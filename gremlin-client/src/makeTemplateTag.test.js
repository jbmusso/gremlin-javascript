require('chai').should();
import { createClient, makeTemplateTag } from './';
import { assert } from 'chai';

import { get } from 'lodash';

const client = createClient();
const gremlin = makeTemplateTag(client);

describe('Template tag', () => {
  it('should execute a tagged template with no binding', async done => {
    const vertices = await gremlin`g.V()`;
    assert.lengthOf(vertices, 6);

    done();
  });

  it('should execute a tagged template with a binding', async done => {
    const id = 1;
    const vertices = await gremlin`g.V(${id})`;
    const [vertex] = vertices;

    assert.lengthOf(vertices, 1);
    assert.equal(get(vertex, '["@value"].id["@value"]') || vertex.id, id);

    done();
  });

  it('should execute a tagged template with multiple bindings', async done => {
    const ids = [1, 3];

    const vertices = await gremlin`g.V(${ids[0]}, ${ids[1]})`;
    const [v1, v2] = vertices;

    assert.lengthOf(vertices, 2);

    assert.equal(get(v1, '["@value"].id["@value"]') || v1.id, ids[0]);
    assert.equal(get(v2, '["@value"].id["@value"]') || v2.id, ids[1]);

    done();
  });

  it('should attach the query object to the returned Promise', () => {
    const ids = [1, 3];
    const query = gremlin`g.V(${ids[0]}, ${ids[1]})`;

    assert.property(query, 'query');
    assert.deepProperty(query, 'query.gremlin');
    assert.deepProperty(query, 'query.bindings');
  });
});
