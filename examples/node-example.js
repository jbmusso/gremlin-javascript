var gremlin = require('../');

var client = gremlin.createClient();


var script = 'g.V[1..2]';

// Callback style
client.execute(script, function(err, res) {
  console.log(err, res);
});

// Stream style
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
