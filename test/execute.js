/*jshint -W030 */
'use strict';
var gremlin = require('../');

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

    client.execute('g.V()', function() { });
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

    client.execute('g.V(1)', null, { args: { language: 'nashorn' }}, function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(1);
      done();
    });
  });

  it('should handle bindings and optional args', function(done) {
    var client = gremlin.createClient();

    client.execute('g.V(x)', { x: 1 }, { args: { language: 'nashorn' }}, function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(1);
      done();
    });
  });

  it.skip('should handle errors', function(done) {
    var client = gremlin.createClient();
    // pass a buggy script (missing parenthese)
    var script = 'g.V(';

    client.execute(script, function(err, result) {
      (err === null).should.be.false;
      done();
    });
  });
});