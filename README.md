gremlin-client
==============

A proof of concept WebSocket JavaScript client for TinkerPop3 Gremlin Server.

Tested with Node.js v0.10.29 and v0.11.13.
Tested with Chrome 35, Firefox 28, Safari 7.

## Installation

Gremlin Client is an AMD/CommonJS module that works in both Node.js and WebSocket enabled browsers.

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

The `options` object currently allows you to set two options:
* `session`: whether to use sessions or not (default: `false`)
* `language`: the script engine to use on the server, see your gremlin-server.yaml file (default: `"gremlin-groovy"`)
* `op` (advanced usage): The name of the "operation" to execute based on the available OpProcessor (default: `"eval"`)
* `processor` (advanced usage): The name of the OpProcessor to utilize (default: `""`)
* `accept`: (default: `"application/json"`)

### Sending scripts to Gremlin Server for execution
The client supports two modes: streaming results, or traditional callback mode.

#### Stream mode: client.stream(script)

Return a Node.js stream which emits a `data` event with the raw data returned by Gremlin Server every time it receives a message (ie. the raw message returned by Gremlin Server). The stream simultaneously also emits a higher level `result` event, with `message.result` as a payload.

The stream emits an `end` event when the client receives the last `statusCode: 299` message.

```javascript
var query = client.stream('g.V()');

query.on('data', function(result, message) {
  console.log(result);
});

query.on('end', function(message) {
  console.log("All results fetched", message);
});

```

#### Callback mode: client.execute(script, callback)

Will execute the provided callback when all results are actually returned from the server.

```javascript
var client = gremlin.createClient();

client.execute('g.V()', function(err, result, lastMessage, command) {
  if (!err) {
    console.log(result)
  }
});
```

The client will internally concatenate all partial results returned over different messages (possibly, depending on the total number of results and the value of `resultIterationBatchSize` set in your .yaml file).

When the client receives the final `statusCode: 299` message, the callback will be executed.

### Adding bound parameters to your scripts

For better performance and security concerns, you may wish to send bound parameters to your scripts.

```javascript
var client = gremlin.createClient();

client.execute('g.v(id)', { id: 1 }, function(err, result) {
  // Handle result
});
```

### Overriding low level settings on a per request basis

For advanced usage, for example if you wish to set the `op` or `processor` values for a given request only, you may wish to override the client level settings in the raw message sent to Gremlin Server:

```javascript
client.execute('g.v(1)', null, { args: { language: 'nashorn' }}, function(err, result) {
  // Handle result
});
```

Because we're not sending any bound parameters, notice how the second argument **must** be set to `null` so the low level message object is not mistaken with bound arguments.

If you wish to also send bound parameters while overriding the low level message, you can do the following:

```javascript
client.execute('g.v(id)', { id: 1 }, { args: { language: 'nashorn' }}, function(err, result) {
  // Handle result
});
```

The same method signature also applies to `client.stream()`:

```javascript
var s = client.stream(script, bindings, message);
```


### Using Gremlin-JavaScript syntax with Nashorn

Providing your configured `nashorn` script engine in your `gremlin-server.yaml` file, you can send and execute Gremlin-JavaScript formatted queries:

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
client.execute(script, function(err, result) {
  // Handle result
});
```

The client gets a string representation of the function passed to `client.stream()` or `client.query()` by calling the `.toString()` method.

Passing bound parameters and/or low level message will also work when using nashorn script engine.

## Running the Examples

This section assumes that you configured `resultIterationBatchSize: 1` in your Gremlin Server .yaml config file and loaded the default TinkerPop graph with `scripts: [scripts/generate-classic.groovy]`


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

## Features

* commands issued before the WebSocket is opened are queued and sent when it's ready.

## To do list

* handle any errors
* reconnect WebSocket if connection is lost
* support `.execute()` with promise
* secure WebSocket
* tests
* performance optimization

