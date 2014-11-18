/*jshint -W030 */
var gremlin = require('../');

describe('Bindings', function() {
  it('should support bindings with client.execute()', function(done) {
    var client = gremlin.createClient();

    client.execute('g.v(x)', { x: 1 }, function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(1);
      done();
    });
  });

  it('should support bindings with client.stream()', function(done) {
    var client = gremlin.createClient();
    var stream = client.stream('g.v(x)', { x: 1 });

    stream.on('data', function(result) {
      result.id.should.equal(1);
    });

    stream.on('end', function() {
      done();
    });
  });

  it('should give an error with erroneous binding name in .exec', function(done) {
    var client = gremlin.createClient();

    // This is supposed to throw a NoSuchElementException in Gremlin Server:
    // --> "The vertex with id id of type  does not exist in the graph"
    // id is a reserved (imported) variable and can't be used in a script
    client.execute('g.v(id)', { id: 1 }, function(err, result) {
      (err !== null).should.be.true;
      (result === undefined).should.be.true;
      done();
    });
  });
});