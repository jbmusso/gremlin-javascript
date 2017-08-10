[![Build Status](https://travis-ci.org/jbmusso/gremlin-javascript.svg?branch=master)](https://travis-ci.org/jbmusso/gremlin-javascript) [![Coverage Status](https://coveralls.io/repos/github/jbmusso/gremlin-javascript/badge.svg?branch=master)](https://coveralls.io/github/jbmusso/gremlin-javascript?branch=master) [![npm](https://img.shields.io/npm/dt/gremlin.svg)](https://www.npmjs.com/package/gremlin)

gremlin-javascript
==================

A WebSocket JavaScript client for TinkerPop3 Gremlin Server. Works in Node.js and modern browsers.

## Installation

```
npm install gremlin --save
```

## Quick start

```javascript
import { createClient } from 'gremlin';

const client = createClient();

client.execute('g.V().has("name", name)', { name: 'Alice' }, (err, results) => {
  if (err) {
    return console.error(err)
  }

  console.log(results);
});
```

### Using ES2015/2016

```javascript
import { createClient, makeTemplateTag } from 'gremlin';

const client = createClient();
const gremlin = makeTemplateTag(client);

const fetchByName = async (name) => {
  const users = await gremlin`g.V().has('name', ${name})`;
  console.log(users);
}

fetchByName('Alice');
```

### Experimental: JavaScript Gremlin language variant

This library has partial support for [Gremlin-JavaScript language variant](http://tinkerpop.apache.org/docs/3.2.4/reference/#_on_gremlin_language_variants). It currently sends Groovy strings (rather than bytecode) and automatically escapes primitives. However, it does not support sending anonymous functions. Under the hood, it serializes `Traversal` to Groovy using an early version of [zer](https://github.com/jbmusso/zer).

The following works with a recent version of Node.js (tested with v7.6.0):
```javascript
import { createClient, statics } from 'gremlin';

const client = createClient();
const g = client.traversalSource();
const { both } = statics;

// And then, within any async function:

const results = await g.V().repeat(both('created')).times(2).toPromise();
// results.length === 16;
```

## Usage

### Creating a new client

```javascript
// Assuming Node.js or Browser environment with browserify:
import Gremlin from 'gremlin';

// Will open a WebSocket to ws://localhost:8182 by default
const client = Gremlin.createClient();
```
This is a shorthand for:
```javascript
const client = Gremlin.createClient(8182, 'localhost');
```

If you want to use Gremlin Server sessions, you can set the `session` argument as true in the `options` object:
```javascript
const client = Gremlin.createClient(8182, 'localhost', { session: true });
```

The `options` object currently allows you to set the following options:
* `session`: whether to use sessions or not (default: `false`)
* `language`: the script engine to use on the server, see your gremlin-server.yaml file (default: `"gremlin-groovy"`)
* `op` (advanced usage): The name of the "operation" to execute based on the available OpProcessor (default: `"eval"`)
* `processor` (advanced usage): The name of the OpProcessor to utilize (default: `""`)
* `accept` (advanced usage): mime type of returned responses, depending on the serializer (default: `"application/json"`)
* `path`: a custom URL connection path if connecting to a Gremlin server behind a WebSocket proxy
* `ssl`: whether to use secure WebSockets or not (default: `false`)
$ `rejectUnauthorized`: when using ssl, whether to reject self-signed certificates or not (default: `true`). Useful in development mode when using gremlin-server self signed certificates. Do NOT use self-signed certificates with this option in production.
* `user` : username to use for SASL authentication
* `password` : password to use for SASL authentication

## Using SASL Authentication

If you want to use [SASL Authentication] (http://tinkerpop.apache.org/docs/3.2.5/dev/provider/#_authentication) with your gremlin server:

```javascript
import { createClient } from 'gremlin';

const client = Gremlin.createClient(8182, 'localhost', { ssl:true, user:'user', password:'password' });

client.execute('g.V()', { }, (err, results) => {
  if (err) {
    return console.error(err)
  }

  console.log(results);
});
```

### Executing Gremlin queries

The client currently supports three modes:
* callback mode (with internal buffer)
* promise mode
* streaming moderesults
* streaming protocol messages (low level API, for advanced usages)

#### Callback mode: client.execute(script, bindings, message, callback)

Will execute the provided callback when all results are actually returned from the server.

```javascript
client.execute('g.V()', (err, results) => {
  if (!err) {
    console.log(results) // notice how results is *always* an array
  }
});
```

The client will internally concatenate all partial results returned over different messages (depending on the total number of results and the value of `resultIterationBatchSize` set in your .yaml file).

When the client receives the final `statusCode: 299` message, the callback will be executed.

#### Promise/template mode: Gremlin.makeTemplateTag(client);

The EcmaScript2015 specification added support for Promise and tagged template literals to JavaScript. Gremlin client leverages these features and offers an alternative way to execute Gremlin queries.

`makeTemplateTag(client)` will return a template function, or 'tag', bound to a given Gremlin client instance. Calling that template will return a `Promise` of execution of the given script using the registered client, while simultaneously escaping all parameters for performance and security concerns.

```javascript
import { createClient, makeTemplateTag } from 'gremlin';

const client = createClient();
const gremlin = makeTemplateTag(client);

gremlin`g.V().has('name', ${name})` // template tag that returns a Promise
  .then((vertices) => {
    console.log(vertices)
  })
  .catch((err) => {
    // Something went wrong
  })
```

For easier debugging, you can also preview the raw query sent to Gremlin server:
```javascript
const name = 'Bob';
const { query } = gremlin`g.V().has('name', ${name})`;
console.log(query);
// output:
//   { gremlin: 'g.V().has(\'name\', p1)', bindings: { p1: 'Bob' } }
```

Because the `gremlin` template literal returns a `Promise`, it can be used in conjunction with the async function proposal from ES2016 to execute Gremlin queries with a shortened syntax:

```javascript
const fetchByName = async (name) => {
  const users = await gremlin`g.V().has('name', ${name})`;
  console.log(users);
}

fetchByName('Alice');
```

#### Stream mode

##### client.stream(script, bindings, message)

Return a Node.js ReadableStream set in Object mode. The stream emits a distinct `data` event per query result returned by Gremlin Server.

Internally, a 1-level flatten is performed on all raw protocol messages returned. If you do not wish this behavior and prefer handling raw protocol messages with batched results, prefer using `client.messageStream()`.

The order in which results are returned is guaranteed, allowing you to effectively use `order` steps and the like in your Gremlin traversal.

The stream emits an `end` event when the client receives the last `statusCode: 299` message returned by Gremlin Server.

```javascript
const query = client.stream('g.V()');

// If playing with classic TinkerPop graph, will emit 6 data events
query.on('data', (result) => {
  // Handle first vertex
  console.log(result);
});

query.on('end', () => {
  console.log('All results fetched');
});
```

This allows you to effectively `.pipe()` the stream to any other Node.js WritableStream/TransformStream.

##### client.messageStream(script, bindings, message)

A lower level method that returns a `ReadableStream` which emits the raw protocol messages returned by Gremlin Server as distinct `data` events.

If you wish a higher-level stream of `results` rather than protocol messages, please use `client.stream()`.

Although a public method, this is recommended for advanced usages only.

```javascript
const client = Gremlin.createClient();

const stream = client.messageStream('g.V()');

// Will emit 3 events with a resultIterationBatchSize set to 2 and classic graph defined in gremlin-server.yaml
stream.on('data', (message) => {
  console.log(message.result); // Array of 2 vertices
});
```

### Adding bound parameters to your scripts

For better performance and security concerns (script injection), you must send bound parameters (`bindings`) with your scripts.

`client.execute()`, `client.stream()` and `client.messageStream()` share the same function signature: `(script, bindings, querySettings)`.

Notes/Gotchas:
- Any bindings set to `undefined` will be automatically escaped with `null` values (first-level only) in order to generate a valid JSON string sent to Gremlin Server.
- You cannot use bindings whose names collide with Gremlin reserved keywords (statically imported variables), such as `id`, `label` and `key` (see [https://github.com/jbmusso/gremlin-javascript/issues/23](issue#23)). This is a TinkerPop3 Gremlin Server limitation. Workarounds: `vid`, `eid`, `userId`, etc.

#### (String, Object) signature

```javascript
const client = Gremlin.createClient();

client.execute('g.v(vid)', { vid: 1 }, (err, results) => {
  console.log(results[0]) // notice how results is always an array
});
```

#### (Object) signature

Expects an `Object` as first argument with a `gremlin` property holding a `String` and a `bindings` property holding an `Object` of bound parameters.

```javascript
const client = Gremlin.createClient();
const query = {
  gremlin: 'g.V(vid)',
  bindings: {
    vid: 1
  }
}

client.execute(query, (err, results) => {
  console.log(results[0])
});
```

### Overriding low level settings on a per request basis

For advanced usage, for example if you wish to set the `op` or `processor` values for a given request only, you may wish to override the client level settings in the raw message sent to Gremlin Server:

```javascript
client.execute('g.v(1)', null, { args: { language: 'nashorn' }}, (err, results) => {
  // Handle result
});
```
Basically, all you have to do is provide an Object as third parameter to any `client.stream()`, `client.execute()` or `client.streamMessage()` methods.

Because we're not sending any bound parameters (`bindings`) in this example, notice how the second argument **must** be set to `null` so the low level message object is not mistaken with bound arguments.

If you wish to also send bound parameters while overriding the low level message, you can do the following:

```javascript
client.execute('g.v(vid)', { vid: 1 }, { args: { language: 'nashorn' }}, (err, results) => {
  // Handle err and results
});
```

Or in stream mode:
```javascript
client.stream('g.v(vid)', { vid: 1 }, { args: { language: 'nashorn' }})
  .pipe(/* ... */);
```

### Gremlin.bindForClient()

Given a map of functions returning query `Object`s (`{ gremlin, bindings }`), returns a map of function promising execution of these queries with the given Gremlin client.

This function is especially useful when used with [gremlin-loader](https://github.com/jbmusso/gremlin-loader), a Webpack loader which imports functions from `.groovy` files as `Object<String, Functions>` where each functions returns query `Object`s that need to be executed with a client.

```javascript
import { bindForClient, createClient } from 'gremlin';

// A function returning a Gremlin query object { gremlin, bindings }
const getByName = (name) => ({
  gremlin: 'g.V().has("name", name)',
  bindings: { name }
});

const client = createClient();
const queries = bindForClient(client, { getByName });

// Then, within an async function:
const users = await queries.getByName('Alice');
```

### Using Gremlin-JavaScript syntax with Nashorn

Please see [/docs/UsingNashorn.md](Using Nashorn).

## Running the Examples

Start your own Gremlin Server with the default TinkerPop graph loaded by using `scripts: [scripts/generate-classic.groovy]` in your `gremlin-server.yaml` config file.

### Node.js

To run the command line example:
```shell
npm run examples:node
```

### Browser

Build library:
```shell
npm run build:umd
```

Start the example server (listens on port 3000):
```
npm run examples:browser
```

Open [http://localhost:3000/examples/gremlin.html](http://localhost:3000/examples/gremlin.html) for an example on how a list of six vertices is being populated as the vertices are being streamed down from Gremlin Server.

## To do list

* better error handling
* emit more client events
* reconnect WebSocket if connection is lost
* add option for secure WebSocket
* more tests
* performance optimization

## License

MIT(LICENSE)
