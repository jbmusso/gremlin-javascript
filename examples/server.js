var http = require('http');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');


var serve = serveStatic('./');

// Create server
var server = http.createServer(function(req, res) {
  var done = finalhandler(req, res);
  serve(req, res, done);
});

// Listen
var port = 3000;
server.listen(port);
console.log('Gremlin Client example server listening on port', port);