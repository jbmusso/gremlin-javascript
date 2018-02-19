require('chai').should();
import { assert, expect } from 'chai';
import gremlin, { statics } from './';

import { get } from 'lodash';

describe('.execute()', function() {
  it('should return a result and a response', function(done) {
    var client = gremlin.createClient();

    client.execute('g.V()', function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(6);
      done();
    });
  });

  it('should queue command before the client is connected', function(done) {
    var client = gremlin.createClient();

    client.execute('g.V()', function() {});
    client.queue.length.should.equal(1);
    done();
  });

  it('should send commands after the client is connected', function(done) {
    var client = gremlin.createClient();

    client.on('connect', function() {
      client.execute('g.V()', function(err, result) {
        (err === null).should.be.true;
        result.length.should.equal(6);
        done();
      });
    });
  });

  it('should handle optional args', function(done) {
    var client = gremlin.createClient();

    client.execute(
      'g.V(1)',
      null,
      { args: { language: 'gremlin-groovy' } },
      function(err, result) {
        (err === null).should.be.true;
        result.length.should.equal(1);
        done();
      },
    );
  });

  it('should handle bindings and optional args', function(done) {
    var client = gremlin.createClient();

    client.execute(
      'g.V(x)',
      { x: 1 },
      { args: { language: 'gremlin-groovy' } },
      function(err, result) {
        (err === null).should.be.true;
        result.length.should.equal(1);
        done();
      },
    );
  });

  it('should handle an object as first argument', done => {
    const client = gremlin.createClient();
    const query = {
      gremlin: 'g.V(vid)',
      bindings: {
        vid: 1,
      },
    };

    client.execute(query, (err, result) => {
      (err === null).should.be.true;
      result.length.should.equal(1);
      const id = get(result[0], '["@value"].id["@value"]') || result[0].id;
      id.should.equal(1);
      done();
    });
  });

  it('should merge bindings with first-argument object own params', done => {
    const client = gremlin.createClient();
    const query = {
      gremlin: 'g.V(vid, second)',
      bindings: {
        vid: 1,
      },
    };

    client.execute(query, { second: 2 }, (err, result) => {
      (err === null).should.be.true;
      result.length.should.equal(2);
      const id1 = get(result[0], '["@value"].id["@value"]') || result[0].id;
      const id2 = get(result[1], '["@value"].id["@value"]') || result[1].id;
      id1.should.equal(1);
      id2.should.equal(2);
      done();
    });
  });

  it('should handle errors', function(done) {
    var client = gremlin.createClient();
    // pass a buggy script (missing parenthese)
    var script = 'g.V(';

    client.execute(script, function(err, result) {
      (err === null).should.be.false;
      expect(err.rawMessage).to.have.property('status');
      expect(err.rawMessage).to.have.property('requestId');
      done();
    });
  });

  it('should fire the callback with an empty array when handling a 204 NO_CONTENT code', function(done) {
    // @see https://github.com/jbmusso/gremlin-javascript/issues/17
    var client = gremlin.createClient();
    var script = 'g.V().limit(0)';

    client.execute(script, function(err, result) {
      result.should.be.an('array');
      result.length.should.equal(0);
      done();
    });
  });

  it('should execute query against an aliased graph', done => {
    const client = gremlin.createClient({ aliases: { h: 'g' } });

    client.execute('h.V()', (err, results) => {
      (err === null).should.be.true;
      results.length.should.equal(6);

      done();
    });
  });

  it('should serialize payloads with utf-8 special characters', done => {
    const client = gremlin.createClient();

    client.execute(`g.V().has('name', 'é')`, (err, results) => {
      (err === null).should.be.true;
      results.length.should.equal(0);
      done();
    });
  });

  it('should handle receiving responses to missing requests', done => {
    const client = gremlin.createClient();
    const warnings = [];
    client.on('warning', warning => {
      warnings.push(warning);
    });

    const message = {
      requestId: 'nonexistant',
      status: {
        code: 200,
        message: 'data',
      },
    };

    warnings.length.should.equal(0);
    client.handleProtocolMessage({
      data: new Buffer(JSON.stringify(message), 'utf8'),
    });

    // Have to cycle so that the event emitter can fire
    setTimeout(() => {
      warnings.length.should.equal(1);
      warnings[0].code.should.equal('OrphanedResponse');
      done();
    });
  });

  it('should handle malformed responses', done => {
    const client = gremlin.createClient();
    const warnings = [];
    client.on('warning', warning => {
      warnings.push(warning);
    });

    warnings.length.should.equal(0);
    client.handleProtocolMessage({
      data: new Buffer('badmessage', 'utf8'),
    });

    // Have to cycle do that the event emitter can fire
    setTimeout(() => {
      warnings.length.should.equal(1);
      warnings[0].code.should.equal('MalformedResponse');
      done();
    });
  });

  it('should support Gremlin-JavaScript language variant', async () => {
    const client = gremlin.createClient();
    const g = client.traversalSource();
    const { both } = statics;

    const results = await g
      .V()
      .repeat(both('created'))
      .times(2)
      .toPromise();
    assert.equal(results.length, 16);
  });
});
