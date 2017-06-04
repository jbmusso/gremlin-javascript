var http = require('http');



var gremlin = require('../src');

var client = gremlin.createClient();


var script = 'g.V().range(1, 2)';

// Callback style
client.execute(script, function(err, res) {
  console.log(err, res);
});


client.on('error', (err) => {
  console.log('oops error', err.message);
});




var server = http.createServer(function(req, res) {
  // var done = finalhandler(req, res);
  // serve(req, res, done);
  res.send('yo');
});

// Listen
var port = 3000;
server.listen(port);
console.log('Gremlin Client example server listening on port', port);