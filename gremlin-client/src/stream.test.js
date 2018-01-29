require('chai').should();
import gremlin from './';
import { get } from 'lodash';

describe('.stream()', function() {
  it('should emit `data` events with a chunk of results and the raw response', function(done) {
    var client = gremlin.createClient();
    var s = client.stream('g.V()');

    var results = [];

    s.on('data', function(result) {
      results.push(result);
    });

    s.on('end', function() {
      results.length.should.equal(6);
      done();
    });
  });

  it('should handle bound parameters', function(done) {
    var client = gremlin.createClient();
    var s = client.stream('g.V(x)', { x: 1 });

    s.on('data', function(result) {
      const id = get(result, '["@value"].id["@value"]') || result.id;
      id.should.equal(1);
    });

    s.on('end', function() {
      done();
    });
  });

  it('should handle optional args', function(done) {
    var client = gremlin.createClient();
    var s = client.stream('g.V(1)', null, {
      args: { language: 'gremlin-groovy' },
    });

    s.on('data', function(result) {
      const id = get(result, '["@value"].id["@value"]') || result.id;
      id.should.equal(1);
    });

    s.on('end', function() {
      done();
    });
  });

  it.skip('should handle bindings and optional args', function(done) {
    var client = gremlin.createClient();
    var s = client.stream(
      'g.V(xyz)',
      { xyz: 1 },
      { args: { language: 'gremlin-groovy' } },
    );

    s.on('data', function(result) {
      result.xyz.should.equal(1);
    });

    s.on('end', function() {
      done();
    });
  });

  it('should handle errors', function(done) {
    var client = gremlin.createClient();
    // pass a buggy script (missing parenthese)
    var script = 'g.V(';
    var s = client.stream(script);

    s.on('error', function(err) {
      (err === null).should.be.false;
      done();
    });
  });
});
