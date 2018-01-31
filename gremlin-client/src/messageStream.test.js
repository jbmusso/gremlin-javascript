require('chai').should();
import gremlin from './';

describe('.messageStream', function() {
  it('should return a stream of low level messages', function(done) {
    var client = gremlin.createClient();

    var s = client.messageStream('g.V()');

    s.on('data', function(message) {
      message.status.code.should.be.within(200, 206);
      const { data } = message.result;

      if (data['@type']) {
        // tinkerpop 3.3
        data['@value'].should.be.an('array');
      } else {
        // tinkerpop 3.2
        data.should.be.an('array');
      }
    });

    s.on('end', function() {
      done();
    });
  });
});
