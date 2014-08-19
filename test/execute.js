/*jshint -W030 */
var gremlin = require('../');

describe('.exec()', function() {
  it('should queue command before the client is connecte', function(done) {
    var client = gremlin.createClient();

    client.execute('g.V()', function() { });
    client.queue.length.should.equal(1);
    done();
  });

  it('should send commands after the client is connected', function(done) {
    var client = gremlin.createClient();

    client.on('connect', function() {
      client.execute('g.V()', function(err, response) {
        (err === null).should.be.true;
        response.result.length.should.equal(6);
        done();
      });
    });
  });
});