'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeTemplateTag = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.createClient = createClient;

var _GremlinClient = require('./GremlinClient');

var _GremlinClient2 = _interopRequireDefault(_GremlinClient);

var _gremlinTemplateString = require('gremlin-template-string');

var _gremlinTemplateString2 = _interopRequireDefault(_gremlinTemplateString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createClient(port, host, options) {
  if ((typeof port === 'undefined' ? 'undefined' : _typeof(port)) === 'object') {
    options = port;
    port = undefined;
  }

  if ((typeof host === 'undefined' ? 'undefined' : _typeof(host)) === 'object') {
    options = host;
    host = undefined;
  }

  return new _GremlinClient2.default(port, host, options);
};

var makeTemplateTag = exports.makeTemplateTag = function makeTemplateTag(client) {
  return function () {
    var query = _gremlinTemplateString2.default.apply(undefined, arguments);
    var promise = new Promise(function (resolve, reject) {
      return client.execute(query, function (err, results) {
        return err ? reject(err) : resolve(results);
      });
    });
    // Let's attach the query for easier debugging
    promise.query = query;

    return promise;
  };
};

exports.default = {
  createClient: createClient,
  makeTemplateTag: makeTemplateTag
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7UUFJZ0I7O0FBSmhCOzs7O0FBQ0E7Ozs7OztBQUdPLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0QixJQUE1QixFQUFrQyxPQUFsQyxFQUEyQztBQUNoRCxNQUFJLFFBQU8sbURBQVAsS0FBZ0IsUUFBaEIsRUFBMEI7QUFDNUIsY0FBVSxJQUFWLENBRDRCO0FBRTVCLFdBQU8sU0FBUCxDQUY0QjtHQUE5Qjs7QUFLQSxNQUFJLFFBQU8sbURBQVAsS0FBZ0IsUUFBaEIsRUFBMEI7QUFDNUIsY0FBVSxJQUFWLENBRDRCO0FBRTVCLFdBQU8sU0FBUCxDQUY0QjtHQUE5Qjs7QUFLQSxTQUFPLDRCQUFrQixJQUFsQixFQUF3QixJQUF4QixFQUE4QixPQUE5QixDQUFQLENBWGdEO0NBQTNDOztBQWNBLElBQU0sNENBQWtCLFNBQWxCLGVBQWtCLENBQUMsTUFBRDtTQUFZLFlBQXNCO0FBQy9ELFFBQU0sUUFBUSwyREFBUixDQUR5RDtBQUUvRCxRQUFNLFVBQVUsSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVjthQUMxQixPQUFPLE9BQVAsQ0FBZSxLQUFmLEVBQXNCLFVBQUMsR0FBRCxFQUFNLE9BQU47ZUFDcEIsTUFBTSxPQUFPLEdBQVAsQ0FBTixHQUFvQixRQUFRLE9BQVIsQ0FBcEI7T0FEb0I7S0FESSxDQUF0Qjs7QUFGeUQsV0FRL0QsQ0FBUSxLQUFSLEdBQWdCLEtBQWhCLENBUitEOztBQVUvRCxXQUFPLE9BQVAsQ0FWK0Q7R0FBdEI7Q0FBWjs7a0JBYWhCO0FBQ2IsNEJBRGE7QUFFYixrQ0FGYSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBHcmVtbGluQ2xpZW50IGZyb20gJy4vR3JlbWxpbkNsaWVudCc7XG5pbXBvcnQgdGVtcGxhdGUgZnJvbSAnZ3JlbWxpbi10ZW1wbGF0ZS1zdHJpbmcnO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDbGllbnQocG9ydCwgaG9zdCwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIHBvcnQgPT09ICdvYmplY3QnKSB7XG4gICAgb3B0aW9ucyA9IHBvcnQ7XG4gICAgcG9ydCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgaG9zdCA9PT0gJ29iamVjdCcpIHtcbiAgICBvcHRpb25zID0gaG9zdDtcbiAgICBob3N0ID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBHcmVtbGluQ2xpZW50KHBvcnQsIGhvc3QsIG9wdGlvbnMpO1xufTtcblxuZXhwb3J0IGNvbnN0IG1ha2VUZW1wbGF0ZVRhZyA9IChjbGllbnQpID0+ICguLi5ncmVtbGluQ2h1bmtzKSA9PiB7XG4gIGNvbnN0IHF1ZXJ5ID0gdGVtcGxhdGUoLi4uZ3JlbWxpbkNodW5rcyk7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgIGNsaWVudC5leGVjdXRlKHF1ZXJ5LCAoZXJyLCByZXN1bHRzKSA9PlxuICAgICAgZXJyID8gcmVqZWN0KGVycikgOiByZXNvbHZlKHJlc3VsdHMpXG4gICAgKVxuICApO1xuICAvLyBMZXQncyBhdHRhY2ggdGhlIHF1ZXJ5IGZvciBlYXNpZXIgZGVidWdnaW5nXG4gIHByb21pc2UucXVlcnkgPSBxdWVyeTtcblxuICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBjcmVhdGVDbGllbnQsXG4gIG1ha2VUZW1wbGF0ZVRhZ1xufVxuIl19