'use strict';
var gremlin = require('../');

describe('.buildCommand()', function() {
  describe('session', function() {
    it('should support attaching a command to a session', function() {
      var client = gremlin.createClient({ session: true });

      var command = client.buildCommand();

      command.message.processor.should.equal('session');
      (command.message.args.session === undefined).should.not.be.true;
    });

    it('should allow setting a custom processor', function() {
      var customProcessor = 'shouldNotBeIgnored';
      var client = gremlin.createClient({ session: true, processor: customProcessor });

      var command = client.buildCommand();

      command.message.processor.should.equal(customProcessor);
      (command.message.args.session === undefined).should.not.be.true;
    });

    it('should allow setting a per-message processor when using sessions', function() {
      var customProcessor = 'shouldNotBeIgnored';

      var client = gremlin.createClient(8182, 'localhost', { session: true });

      var command = client.buildCommand(null, null, { processor: customProcessor });

      command.message.processor.should.equal(customProcessor);
    });
  });
});