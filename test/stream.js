var gremlin = require('../');


describe('.stream()', function() {
  it('should emit `data` events with a chunk of results and the raw response', function(done) {
    var client = gremlin.createClient({ language: 'nashorn' });
    var count = 0;

    var s = client.stream(function() { g.V(); });

    s.on('data', function(result, response) {
      result.should.exist;
      response.should.exist;
      response.code.should.equal(200);

      count += 1;
    });

    s.on('end', function() {
      count.should.equal(6);
      done();
    });
  });

  it('should handle bound parameters', function(done) {
    var client = gremlin.createClient();

    var s = client.stream('g.v(id)', { id: 1 });

    s.on('data', function(result, response) {
      result.length.should.equal(1);
      response.code.should.equal(200);
    });

    s.on('end', function() {
      done();
    });
  });

  it('should handle optional args', function(done) {
    var client = gremlin.createClient();

    var s = client.stream('g.v(1)', null, { args: { language: 'nashorn' }});

    s.on('data', function(result, response) {
      result.length.should.equal(1);
      response.code.should.equal(200);
    });

    s.on('end', function() {
      done();
    });
  });

  it('should handle bindings and optional args', function(done) {
    var client = gremlin.createClient();

    var s = client.stream('g.v(id)', { id : 1 }, { args: { language: 'nashorn' }});

    s.on('data', function(result, response) {
      result.length.should.equal(1);
      response.code.should.equal(200);
    });

    s.on('end', function() {
      done();
    });
  });
});
