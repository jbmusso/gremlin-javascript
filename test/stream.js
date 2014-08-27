var gremlin = require('../');


describe('.stream()', function() {
  it('should emit `data` events with a chunk of results and the raw response', function(done) {
    var client = gremlin.createClient({ language: 'nashorn' });

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
    var client = gremlin.createClient();

    var s = client.stream('g.v(id)', { id: 1 });

    s.on('data', function(result) {
      result.should.be.an('object');
    });

    s.on('end', function() {
      done();
    });
  });

  it('should handle optional args', function(done) {
    var client = gremlin.createClient();

    var s = client.stream('g.v(1)', null, { args: { language: 'nashorn' }});

    s.on('data', function(result) {
      result.should.be.an('object');
    });

    s.on('end', function() {
      done();
    });
  });

  it('should handle bindings and optional args', function(done) {
    var client = gremlin.createClient();

    var s = client.stream('g.v(id)', { id : 1 }, { args: { language: 'nashorn' }});

    s.on('data', function(result) {
      result.should.be.an('object');
    });

    s.on('end', function() {
      done();
    });
  });
});
