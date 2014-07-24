var gremlin = require('../');

var client = gremlin.createClient(8182, 'localhost', { language: 'nashorn' });


var s = client.stream(function() { g.v(id); }, { id: 1 });

s.on('result', function(result) {
  console.log(result);
});

s.on('end', function(message) {
  console.log("All results fetched", message);
});

s.on('error', function(e) {
  console.log(e);
});
