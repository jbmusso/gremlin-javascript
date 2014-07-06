$(function() {
  var client = gremlin.createClient();

  var script = 'g.V';
  var query = client.stream(script);

  query.on('result', function(d) {
    $("#results").append('<li>'+ JSON.stringify(d[0]) +'</li>');
  });

  query.on('end', function(d) {
    $('body').append('All results fetched');
  });
});