var gremlin = require('../src');

var client = gremlin.createClient(8182, 'localhost', { session: true });


var script = 'g.V().range(1, 2)';

var s = client.stream(script);

s.on('data', function(result) {
  console.log(result);
});

s.on('end', function(message) {
  console.log("All results fetched", message);
});

s.on('error', function(e) {
  console.log(e);
});
