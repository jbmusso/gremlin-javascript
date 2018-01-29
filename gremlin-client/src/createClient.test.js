require('chai').should();
import gremlin from './';
import { assert } from 'chai';

describe('.createClient()', function() {
  it('should create a client with default options', function() {
    var client = gremlin.createClient();

    client.port.should.equal(8182);
    client.host.should.equal('localhost');

    client.options.language.should.eql('gremlin-groovy');
    client.options.session.should.eql(false);
    client.options.op.should.eql('eval');
    client.options.processor.should.eql('');
    client.options.accept.should.eql('application/json');
  });

  it('should allow setting the `session` option', function() {
    var client = gremlin.createClient({ session: true });

    client.port.should.equal(8182);
    client.host.should.equal('localhost');
    client.options.session.should.equal(true);
  });

  it('should allow setting the `language` option', function() {
    // Although 'nashorn' is deprecated, keeping this feature here
    var client = gremlin.createClient({ language: 'nashorn' });

    client.port.should.equal(8182);
    client.host.should.equal('localhost');
    client.options.language.should.equal('nashorn');
  });

  it('should allow setting the `op` option', function() {
    var client = gremlin.createClient({ op: 'test' });

    client.port.should.equal(8182);
    client.host.should.equal('localhost');
    client.options.op.should.equal('test');
  });

  it('should allow setting the `accept` option', function() {
    var client = gremlin.createClient({ accept: 'application/xml' });

    client.port.should.equal(8182);
    client.host.should.equal('localhost');
    client.options.accept.should.equal('application/xml');
  });

  it('should support aliases', function() {
    const client = gremlin.createClient({
      aliases: {
        h: 'g',
      },
    });

    client.options.aliases.should.eql({ h: 'g' });
  });

  it('should override a set `processor` option on a per request basis', function(done) {
    var client = gremlin.createClient({ op: 'foo' });

    client.port.should.equal(8182);
    client.host.should.equal('localhost');
    client.options.op.should.equal('foo');

    var s = client.stream('g.V(1)', null, { op: 'eval' });

    s.on('data', function(result) {
      result.should.be.an('object');
    });

    s.on('end', function() {
      done();
    });
  });

  describe('WebSocket path', () => {
    it('should support a custom websocket path', () => {
      const client = gremlin.createClient({ path: '/foo/bar' });

      client.options.path.should.equal('/foo/bar');
    });

    it('should ensure path is prefixed with a slash', () => {
      const client = gremlin.createClient({ path: 'foo/bar' });

      client.options.path.should.equal('/foo/bar');
    });
  });

  describe('Secure WebSocket', () => {
    it('should support secure SSL websockets', done => {
      const client = gremlin.createClient(
        8192 /* start with docker-compose */,
        {
          ssl: true,
          rejectUnauthorized: false, // using TP-dev self-signed certificate
        },
      );

      client.options.ssl.should.equal(true);
      client.options.rejectUnauthorized.should.equal(false);

      client.execute('1+1', (err, result) => {
        assert.equal(result, 2);
        done();
      });
    });
  });
});
