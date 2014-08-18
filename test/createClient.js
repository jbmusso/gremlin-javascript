var gremlin = require('../');

describe('.createClient()', function() {
  it('should create a client with default options', function() {
    var client = gremlin.createClient();

    client.port.should.equal(8182);
    client.host.should.equal('localhost');
    client.options.should.eql({
      language: 'gremlin-groovy',
      session: false
    });
  });

  it('should allow setting the `session` option', function() {
    var client = gremlin.createClient({ session: true });

    client.port.should.equal(8182);
    client.host.should.equal('localhost');
    client.options.session.should.equal(true);
  });

  it('should allow setting the `language` option', function() {
    var client = gremlin.createClient({ language: 'nashorn' });

    client.port.should.equal(8182);
    client.host.should.equal('localhost');
    client.options.language.should.equal('nashorn');
  });
});