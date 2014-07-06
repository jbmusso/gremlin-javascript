var http = require('http');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');


var serve = serveStatic('../');

// Create server
var server = http.createServer(function(req, res) {
  var done = finalhandler(req, res);
  serve(req, res, done);
});

// Listen
server.listen(3000);