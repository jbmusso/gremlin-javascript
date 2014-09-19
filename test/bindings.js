/*jshint -W030 */
var gremlin = require('../');

describe.skip('Bindings', function() {
  it('should support bindings with client.execute()', function(done) {
    var client = gremlin.createClient();

    client.execute('g.v(id)', { id: 1 }, function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(1);
      done();
    });
  });

  it('should support bindings with client.stream()', function(done) {
    var client = gremlin.createClient();
    var stream = client.stream('g.v(id)', { id: 1 });

    stream.on('data', function(result) {
      result.length.should.equal(1);
    });

    stream.on('end', function() {
      done();
    });
  });
});