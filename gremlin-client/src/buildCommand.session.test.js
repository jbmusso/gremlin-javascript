require('chai').should();

import gremlin from './';

describe('.buildMessage()', function() {
  describe('session', function() {
    it('should support attaching a command to a session', function() {
      var client = gremlin.createClient({ session: true });

      var message = client.buildMessage();

      message.processor.should.equal('session');
      (message.args.session === undefined).should.not.be.true;
    });

    it('should allow setting a custom processor', function() {
      var customProcessor = 'shouldNotBeIgnored';
      var client = gremlin.createClient({
        session: true,
        processor: customProcessor,
      });

      var message = client.buildMessage();

      message.processor.should.equal(customProcessor);
      (message.args.session === undefined).should.not.be.true;
    });

    it('should allow setting a per-message processor when using sessions', function() {
      var customProcessor = 'shouldNotBeIgnored';

      var client = gremlin.createClient(8182, 'localhost', { session: true });

      var message = client.buildMessage(undefined, undefined, {
        processor: customProcessor,
      });

      message.processor.should.equal(customProcessor);
    });
  });
});
