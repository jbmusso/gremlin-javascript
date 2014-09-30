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
      var client = gremlin.createClient({ session: true, processor: 'custom' });

      var command = client.buildCommand();

      command.message.processor.should.equal('custom');
      (command.message.args.session === undefined).should.not.be.true;
    });
  });
});