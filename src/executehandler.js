'use strict';
var highland = require('highland');
var _ = {
  isArray: require('lodash.isarray')
};

function defaultExecuteHandler(messageStream, callback) {
  var errored = false;
  var objectMode = false;

  highland(messageStream)
    .stopOnError(function(err) {
      // TODO: this does not seem to halt the stream properly, and make
      // the callback being fired twice. We need to get rid of the ugly
      // errored variable check.
      errored = true;
      callback(err);
    })
    .map(function(message) {
      objectMode = !_.isArray(message.result.data);

      return message.result.data;
    })
    .sequence()
    .toArray(function(results) {
      if (!errored) {
        callback(null, objectMode ? results[0] : results);
      }
    });
}

module.exports = defaultExecuteHandler;
