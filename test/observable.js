import { createClient } from '../';
import { assert } from 'chai';


describe('.observable()', function () {
  it('should return an Observable', function () {
    const client = createClient();

    const marko = 'marko';
    const query = `g.V().has('name', '${marko}').valueMap()`;

    const results$ = client.observable(query);

    let vertex;
    let error;
    results$.subscribe(
      (result) => vertex = result,
      (err) => error = err,
      () => {
        assert.isUndefined(error);
        assert.deepPropertyVal(vertex, 'name[0]', marko);
      }
    )
  });
});