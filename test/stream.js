var gremlin = require('../');


describe('.stream()', function() {
  it('should emit `result` events', function(done) {
    var client = gremlin.createClient({ language: 'nashorn' });
    var count = 0;

    var s = client.stream(function() { g.V(); });

    s.on('data', function(data) {
      count++;
    });

    s.on('end', function() {
      count.should.not.equal(0);
      done();
    });
  });

  it('should handle bound parameters', function(done) {
    var client = gremlin.createClient();

    var s = client.stream('g.v(id)', { id: 1 });

    s.on('data', function(data) {
      data.result.length.should.equal(1);
    });

    s.on('end', function() {
      done();
    });
  });

  it('should handle optional args', function(done) {
    var client = gremlin.createClient();

    var s = client.stream('g.v(1)', null, { args: { language: 'nashorn' }});

    s.on('data', function(data) {
      data.result.length.should.equal(1);
    });

    s.on('end', function() {
      done();
    });
  });

  it('should handle bindings and optional args', function(done) {
    var client = gremlin.createClient();

    var s = client.stream('g.v(id)', { id : 1 }, { args: { language: 'nashorn' }});

    s.on('data', function(data) {
      data.result.length.should.equal(1);
    });

    s.on('end', function() {
      done();
    });
  });
});
