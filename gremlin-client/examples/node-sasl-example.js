var gremlin = require('../src');

var client = gremlin.createClient(51549, 'localhost', {
    session: false,
    ssl:true,
    user:'username',
    password:'password' });

var script = 'g.V()';

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
