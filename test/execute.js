/*jshint -W030 */
import gremlin from '../';
import g from 'gremlin-template-string';


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

  it('should handle an object as first argument', (done) => {
    const client = gremlin.createClient();
    const id = 1;
    const query = g`g.V(${id})`;

    client.execute(query, (err, result) => {
      (err === null).should.be.true;
      result.length.should.equal(1);
      done();
    });
  });

  it('should merge bindings with first-argument object own params', (done) => {
    const client = gremlin.createClient();
    const id = 1;
    const query = g`g.V(${id}, second)`;

    client.execute(query, { second: 2 }, (err, result) => {
      (err === null).should.be.true;
      result.length.should.equal(2);
      done();
    });
  });

  it('should handle errors', function(done) {
    var client = gremlin.createClient();
    // pass a buggy script (missing parenthese)
    var script = 'g.V(';

    client.execute(script, function(err, result) {
      (err === null).should.be.false;
      done();
    });
  });

  it('should fire the callback with an empty array when handling a 204 NO_CONTENT code', function (done) {
    // @see https://github.com/jbmusso/gremlin-javascript/issues/17
    var client = gremlin.createClient();
    var script = 'g.V().limit(0)';

    client.execute(script, function(err, result) {
      result.should.be.an('array');
      result.length.should.equal(0);
      done();
    });
  })
});
