require('chai').should();
/*jshint -W030 */
import gremlin from './';

describe('Bindings', function() {
  it('should support bindings with client.execute()', function(done) {
    var client = gremlin.createClient();

    client.execute('g.V(x)', { x: 1 }, function(err, result) {
      (err === null).should.be.true;
      result.length.should.equal(1);
      done();
    });
  });

  it('should support bindings with client.stream()', function(done) {
    var client = gremlin.createClient();
    var stream = client.stream('g.V(x)', { x: 1 });

    stream.on('data', function(result) {
      const id = result.id || result['@value'].id['@value'];
      id.should.equal(1);
    });

    stream.on('end', function() {
      done();
    });
  });

  it.skip('should give an error with reserved binding name in .exec', function(done) {
    var client = gremlin.createClient();

    // This is supposed to throw a NoSuchElementException in Gremlin Server:
    // --> "The vertex with id id of type  does not exist in the graph"
    // id is a reserved (imported) variable and can't be used in a script
    client.execute('g.V(id)', { id: 1 }, function(err, result) {
      (err !== null).should.be.true;
      (result === undefined).should.be.true;
      done();
    });
  });

  describe('undefined bindings', function() {
    it(`should remap 'undefined' bindings as 'null' values`, done => {
      const client = gremlin.createClient();

      client.execute('foo', { foo: undefined }, (err, [foo]) => {
        (err === null).should.be.true;
        (foo === null).should.be.true;
        done();
      });
    });

    it(`should not remap falsey bindings as 'null' values`, done => {
      const client = gremlin.createClient();

      client.execute('[foo, bar]', { foo: '', bar: 0 }, (err, [foo, bar]) => {
        (err === null).should.be.true;
        (foo === '').should.be.true;
        (bar['@value'] === 0 || bar === 0).should.be.true;
        done();
      });
    });
  });
});
