var GremlinClient = require('./src/gremlinclient');


module.exports.createClient = function(port, host, session) {
  return new GremlinClient(port, host, session);
};
