/*jshint -W030 */
var gremlin = require('../');

describe('.execute()', function() {
  var client;

  beforeEach(function() {
    client = gremlin.createClient();
  });

  it('should return a result and a response', function(done) {
    client.execute('g.V()', function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(6);
      done();
    });
  });

  it('should queue command before the client is connected', function(done) {
    client.execute('g.V()', function() { });
    client.queue.length.should.equal(1);
    done();
  });

  it('should send commands after the client is connected', function(done) {
    client.on('connect', function() {
      client.execute('g.V()', function(err, result) {
        (err === null).should.be.true;
        result.length.should.equal(6);
        done();
      });
    });
  });

  it('should handle optional args', function(done) {
    client.execute('g.v(1)', null, { args: { language: 'nashorn' }}, function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(1);
      done();
    });
  });

  it('should handle bindings and optional args', function(done) {
    client.execute('g.v(x)', { x: 1 }, { args: { language: 'nashorn' }}, function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(1);
      done();
    });
  });

  it('should handle errors', function(done) {
    // pass a buggy script (missing parenthese)
    var script = 'g.V(';

    client.execute(script, function(err, result) {
      (err === null).should.be.false;
      done();
    });
  });
});