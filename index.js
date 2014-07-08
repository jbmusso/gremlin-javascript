var GremlinClient = require('./src/gremlinclient');


module.exports.createClient = function(port, host) {
  return new GremlinClient();
};