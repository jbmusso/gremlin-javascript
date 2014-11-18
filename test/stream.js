var gremlin = require('../');


describe('.stream()', function() {
  var client;

  beforeEach(function() {
    client = gremlin.createClient();
  });

  it('should emit `data` events with a chunk of results and the raw response', function(done) {
    var s = client.stream(function() { g.V(); });

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
    var s = client.stream('g.v(x)', { x: 1 });

    s.on('data', function(result) {
      result.id.should.equal(1);
    });

    s.on('end', function() {
      done();
    });
  });

  it('should handle optional args', function(done) {
    var s = client.stream('g.v(1)', null, { args: { language: 'nashorn' }});

    s.on('data', function(result) {
      result.id.should.equal(1);
    });

    s.on('end', function() {
      done();
    });
  });

  it('should handle bindings and optional args', function(done) {
    var s = client.stream('g.v(id)', { id : 1 }, { args: { language: 'nashorn' }});

    s.on('data', function(result) {
      result.id.should.equal(1);
    });

    s.on('end', function() {
      done();
    });
  });

  it('should handle errors', function(done) {
    // pass a buggy script (missing parenthese)
    var script = 'g.V(';
    s = client.stream(script);

    s.on('error', function(err) {
      (err === null).should.be.false;
      done();
    });
  });
});
