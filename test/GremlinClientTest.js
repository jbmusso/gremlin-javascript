import Client from '../src/GremlinClient';

describe('GremlinClient', () => {
    describe('.construct()', () => {

        it('should allow setting the `port` option', () => {
            const client = new Client(8183);
            client.on('error', (err) => {}); //catch error
            client.port.should.equal(8183);
        });

        it('should allow setting the `host` option', () => {
            const client = new Client(8182, "otherhost");
            client.on('error', (err) => {}); //catch error
            client.host.should.equal('otherhost');
        });

        it('should allow setting session option', () => {
            const client = new Client(8182, "localhost", {session:true});
            client.port.should.equal(8182);
            client.host.should.equal('localhost');
            client.options.session.should.equal(true);
        });
    });
});
