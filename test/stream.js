var gremlin = require('../');


describe('.stream()', function() {
  it('should emit `result` events', function(done) {
    var client = gremlin.createClient({ language: 'nashorn' });
    var count = 0;

    var s = client.stream(function() { g.V(); });

    s.on('data', function(data) {
      count++;
    });

    s.on('end', function() {
      count.should.not.equal(0);
      done();
    });
  });
});