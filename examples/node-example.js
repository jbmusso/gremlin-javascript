var gremlin = require('../src');

var client = gremlin.createClient();


var script = 'g.V().range(1, 2)';

// Callback style
client.execute(script, function(err, res) {
  console.log(err, res);
});

// Stream style
var s = client.stream(script);

s.on('data', function(result) {
  console.log(result);
});

s.on('end', function() {
  console.log("All results fetched");
});

s.on('error', function(e) {
  console.log(e);
});
