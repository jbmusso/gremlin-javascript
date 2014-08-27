$(function() {
  var client = gremlin.createClient();

  client.on('open', function() {
    console.log("Connection to Gremlin Server established!");
  });

  var script = 'g.V()';
  var query = client.stream(script);

  query.on('data', function(d) {
    $("#results").append('<li>'+ JSON.stringify(d) +'</li>');
  });

  query.on('end', function(d) {
    $('body').append('All results fetched');
  });

  query.on('error', function(e) {
    $('body').append('Could not complete query:', e.message);
  });
});