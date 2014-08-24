var gremlin = require('../');

var client = gremlin.createClient(8182, 'localhost', { language: 'nashorn' });


var script = function() {
  print("Hello from Node.js!");
  print('id:', this.context.getBindings(javax.script.ScriptContext.ENGINE_SCOPE).containsKey('id'), id);

  g.v(id).out('created').filter(function(it) {
    return it.get().value('name') !== 'gremlin';
  });
};

var s = client.stream(script, { id: 1 });

s.on('data', function(result) {
  console.log(result);
});

s.on('end', function(message) {
  console.log("All results fetched", message);
});

s.on('error', function(e) {
  console.log(e);
});
