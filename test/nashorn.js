/*jshint -W030 */
var gremlin = require('../');

describe('Nashorn syntax', function() {
  it.skip('should handle .localeCompare() as replacement for <=> operator', function() {
    var client = gremlin.createClient({ language: 'nashorn' });
    var script = function() {
      g.V().order(function(a, b) {
        return a.get().value('name').localeCompare(b.get().value('name'));
      });
    };

    client.execute(script, function(err, result) {
      (err === null).should.be.true;
      result[0].properties.name[0].value.should.equal('josh');
      result[5].properties.name[0].value.should.equal('vadas');
    });
  });
});