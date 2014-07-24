/*jshint -W030 */
var gremlin = require('../');

describe('.execute() # nashorn', function() {
  it('should process raw JavaScript strings', function(done) {
    var client = gremlin.createClient({ language: 'nashorn' });

    client.execute('g.V().filter(function(it) { return it.get().value("name") !== "gremlin" });', function(err, response) {
      (err === null).should.be.true;
      done();
    });
  });

  it('should process JavaScript functions', function(done) {
    var client = gremlin.createClient({ language: 'nashorn' });

    var script = function() {
      g.V();
    };

    client.execute(script, function(err, response) {
      (err === null).should.be.true;
      response.result.length.should.equal(6);
      done();
    });
  });

  it('should process inlined JavaScript functions', function(done) {
    var client = gremlin.createClient({ language: 'nashorn' });

    client.execute(function() { g.V(); }, function(err, response) {
      (err === null).should.be.true;
      response.result.length.should.equal(6);
      done();
    });
  });

  it('should handle bound parameters', function(done) {
    var client = gremlin.createClient({ language: 'nashorn' });
    var script = function() { g.v(id); };

    client.execute(script, { id: 1 }, function(err, response) {
      (err === null).should.be.true;
      response.result.length.should.equal(1);
      var vertex = response.result[0];
      vertex.id.should.equal(1);
      vertex.properties.name.should.equal('marko');
      done();
    });
  });
});
