## Using nashorn to execute Gremlin-Javascript flavored queries

This section demonstrates how to send Gremlin queries formatted in JavaScript rather than Groovy. You are *not* required to do so in your Node.js or browser environment. You should stick to Groovy for performance concerns and it is recommended you do not use the following in production.

Assuming you configured `nashorn` script engine in your `gremlin-server.yaml` file, you can send and execute Gremlin-JavaScript formatted queries (see example in this repository in `/config`):

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

### Sending a Gremlin-Javascript flavored string

You may simply pass a raw string as first parameter.

```
```

### Sending a JavaScript function body

Enabling nashorn allows a nice trick/hack that consists in extracting the body of a JavaScript function defined in your Node.js/Browser environment, and sending that string to Gremlin server/nashorn for execution:

```javascript
const client = gremlin.createClient({ language: 'nashorn' });

// Wrap a Gremlin query in a JavaScript function
const script = function() {
  g.V().sideEffect(function(a, b) {
    return a.get().value('name').localeCompare(b.get().value('name')); // JavaScript replacement for <=> spaceship operator
  });
};

client.execute(script, (err, results) => {
  // Handle results
});
```

The client internally gets a string representation of the function passed to `client.stream()` or `client.execute()` by calling the `.toString()` method of that function.

Passing bound parameters and/or low level message as second or third arguments will also work when using nashorn script engine.

The Function.toString() trick is just a convenient way to expose the full Groovy/Java API in your local JS environment as well as some syntax highlighting. You can also use loop or try..catch that will be executed in the context of Gremlin Server.

### Caveats

- performance
- relies on a dirty trick