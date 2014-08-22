/*jshint -W030 */
var gremlin = require('../');

describe('.execute() # nashorn', function() {
  it('should process raw JavaScript strings', function(done) {
    var client = gremlin.createClient({ language: 'nashorn' });

    client.execute('g.V().filter(function(it) { return it.get().value("name") !== "gremlin" });', function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(6);
      done();
    });
  });

  it('should process JavaScript functions', function(done) {
    var client = gremlin.createClient({ language: 'nashorn' });

    var script = function() {
      g.V();
    };

    client.execute(script, function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(6);
      done();
    });
  });

  it('should process inlined JavaScript functions', function(done) {
    var client = gremlin.createClient({ language: 'nashorn' });

    client.execute(function() { g.V(); }, function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(6);
      done();
    });
  });
});
