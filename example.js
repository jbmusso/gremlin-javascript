var gremlin = require('./');

var client = gremlin.createClient();


var script = 'g.V[1..2]';

// Callback style
client.execute(script, function(err, res) {
  console.log(err, res);
});

// Stream style
var s = client.stream(script);

s.on('result', function(d) {
  console.log(d);
});

s.on('end', function(d) {
  console.log("All results fetched", d);
});
