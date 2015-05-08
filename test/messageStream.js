var gremlin = require('../');

describe('.messageStream', function() {
  it('should return a stream of low level messages', function(done) {
    var client = gremlin.createClient();

    var s = client.messageStream('g.V()');

    s.on('data', function(message) {
      message.result.data.should.be.an('array');
      message.result.data.length.should.eql(2);
    });

    s.on('end', function() {
      done();
    });
  });
});
