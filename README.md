gremlin-client
==============

A WebSocket JavaScript client for TinkerPop3 Gremlin Server. Works in Node.js and modern browsers.

## Installation

```
npm install gremlin-client --save
```

In the browser, you can require the module with browserify or directly insert a `<script>` tag, which will expose a global `gremlin` variable:
```html
<script type="text/javascript" src="gremlin.js"></script>
```

## Usage

### Creating a new client

```javascript
// Assuming Node.js or Browser environment with browserify:
var gremlin = require('gremlin-client');

// Will open a WebSocket to ws://localhost:8182 by default
var client = gremlin.createClient();
```
This is a shorthand for:
```javascript
var client = gremlin.createClient(8182, 'localhost');
```

If you want to use Gremlin Server sessions, you can set the `session` argument as true in the `options` object:
```javascript
var client = gremlin.createClient(8182, 'localhost', { session: true });
```

The `options` object currently allows you to set the following options:
* `session`: whether to use sessions or not (default: `false`)
* `language`: the script engine to use on the server, see your gremlin-server.yaml file (default: `"gremlin-groovy"`)
* `op` (advanced usage): The name of the "operation" to execute based on the available OpProcessor (default: `"eval"`)
* `processor` (advanced usage): The name of the OpProcessor to utilize (default: `""`)
* `accept` (advanced usage): mime type of returned responses, depending on the serializer (default: `"application/json"`)

### Sending scripts to Gremlin Server for execution
The client supports three modes:
* streaming results
* callback mode (with internal buffer)
* streaming protocol messages (for advanced usages)

#### Stream mode: client.stream(script, bindings, message)

Return a Node.js ReadableStream set in Object mode. The stream emits a `data` event for each result returned by Gremlin Server.

For each low level protocol message with potentially one or more results attached (depending on the value of `resultIterationBatchSize` in your .yaml file), the stream will always reemit one `data` event per result.

The order in which results are returned should be guaranteed, allowing you to effectively use `order` steps and the like in your Gremlin traversal.

The stream emits an `end` event when the client receives the last `statusCode: 299` message returned by Gremlin Server.

```javascript
var query = client.stream('g.V()');

// If playing with classic TinkerPop graph, will emit 6 data events
query.on('data', function(result) {
  // Handle first vertex
  console.log(result);
});

query.on('end', function() {
  console.log("All results fetched");
});
```

This allows you to effectively `.pipe()` the stream to any other Node.js ReadableStream.

#### Callback mode: client.execute(script, bindings, message, callback)

Will execute the provided callback when all results are actually returned from the server.

```javascript
var client = gremlin.createClient();

client.execute('g.V()', function(err, results) {
  if (!err) {
    console.log(results) // Handle an array of results
  }
});
```

The client will internally concatenate all partial results returned over different messages (depending on the total number of results and the value of `resultIterationBatchSize` set in your .yaml file).

When the client receives the final `statusCode: 299` message, the callback will be executed.

#### Message stream mode: client.messageStream(script, bindings, message)

A lower level method that returns a ReadableStream which emits the raw protocol messages returned by Gremlin Server as distinct `data` events.

Although a public method, this is recommended for advanced usages only.

```javascript
var client = gremlin.createClient();

var query = client.messageStream('g.V()');

// Will emit 3 events with a resultIterationBatchSize set to 2 and classic graph
query.on('data', function(message) {
  console.log(message.result); // Array of 2 vertices
});
```

### Adding bound parameters to your scripts

For better performance and security concerns, you may wish to send bound parameters with your scripts.

```javascript
var client = gremlin.createClient();

client.execute('g.v(id)', { id: 1 }, function(err, results) {
  console.log(results[0]) // notice how results is always an array
});
```

Also work with `client.stream()` and `client.messageStream()` for they share the same signature, without the callback as last parameter.

### Overriding low level settings on a per request basis

For advanced usage, for example if you wish to set the `op` or `processor` values for a given request only, you may wish to override the client level settings in the raw message sent to Gremlin Server:

```javascript
client.execute('g.v(1)', null, { args: { language: 'nashorn' }}, function(err, results) {
  // Handle result
});
```
Basically, all you have to do is provide an Object as third parameter to any `client.stream()`, `client.execute()` or `client.streamMessage()` methods.

Because we're not sending any bound parameters in this example, notice how the second argument **must** be set to `null` so the low level message object is not mistaken with bound arguments.

If you wish to also send bound parameters while overriding the low level message, you can do the following:

```javascript
client.execute('g.v(id)', { id: 1 }, { args: { language: 'nashorn' }}, function(err, results) {
  // Handle result
});
```

Or in stream mode:
```javascript
var s = client.stream('g.v(id)', { id: 1 }, { args: { language: 'nashorn' }});
```

### Using Gremlin-JavaScript syntax with Nashorn

Providing your configured `nashorn` script engine in your `gremlin-server.yaml` file, you can send and execute Gremlin-JavaScript formatted queries (see example in this repository in `/config`):

```yaml
scriptEngines: {
  gremlin-groovy: {
    imports: [java.lang.Math],
    staticImports: [java.lang.Math.PI],
    scripts: [scripts/generate-classic.groovy]},
  nashorn: {
      imports: [java.lang.Math],
      staticImports: [java.lang.Math.PI]}}
```

Then, in your Node.js/Browser environment:

```javascript
var client = gremlin.createClient({ language: 'nashorn' });

// Wrap a script definition in a JavaScript function
var script = function() {
  // Retrieve all vertices ordered by name
  g.V().order(function(a, b) {
    return a.get().value('name').localeCompare(b.get().value('name')); // JavaScript replacement for <=> spaceship operator
  });
};

// Send that script function body to Gremlin Server for execution in Nashorn engine
client.execute(script, function(err, results) {
  // Handle result
});
```

The client internally gets a string representation of the function passed to `client.stream()` or `client.execute()` by calling the `.toString()` method.

Passing bound parameters and/or low level message will also work when using nashorn script engine.

You may also simply pass a raw string as first parameter, rather than a function. The Function.toString() trick is just a convenient way to expose the full Groovy/Java API in your local JS environment. You can also use loop or try..catch that will be executed in the context of Gremlin Server.

## Running the Examples

This section assumes that loaded the default TinkerPop graph with `scripts: [scripts/generate-classic.groovy]` in your .yaml config file.


To run the command line example:
```
cd examples
node node-example
```

To run the browser example:
```
cd examples
node server
```
then open [http://localhost:3000/examples/gremlin.html](http://localhost:3000/examples/gremlin.html) for a demonstration on how a list of 6 vertices is being populated as the vertices are being streamed down from Gremlin Server.

## To do list

* better error handling
* emit more client events
* reconnect WebSocket if connection is lost?
* support `.execute()` with promise?
* add option for secure WebSocket
* more tests
* performance optimization

## License

MIT(LICENSE)
