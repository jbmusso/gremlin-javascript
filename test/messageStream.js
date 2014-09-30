var gremlin = require('../');

describe('.messageStream', function() {
  it('should return a stream of low level messages', function(done) {
    var client = gremlin.createClient();

    var s = client.messageStream('g.V()');

    s.on('data', function(message) {
      message.status.code.should.eql(200);
      message.result.data.should.be.an('array');
    });

    s.on('end', function() {
      done();
    });
  });
});
