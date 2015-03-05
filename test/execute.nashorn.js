/*jshint -W030 */
'use strict';
var gremlin = require('../');

describe('.execute() # nashorn', function() {
  it('should process raw JavaScript strings', function(done) {
    var client = gremlin.createClient();
    var script = 'g.V()';

    client.execute(script, function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(6);
      done();
    });
  });

  it('should process raw JavaScript with nashorn disambiguation syntax', function(done) {
    var client = gremlin.createClient();
    var script = 'g.V()["filter(Predicate)"](function(it) { return it.get().property("lang").orElse("") == "java" });';

    client.execute(script, function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(2);
      done();
    });
  });

  it('should process JavaScript functions', function(done) {
    var client = gremlin.createClient();
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
    var client = gremlin.createClient();
    client.execute(function() { g.V(); }, function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(6);
      done();
    });
  });
});
