'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _highland = require('highland');

var _highland2 = _interopRequireDefault(_highland);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function defaultExecuteHandler(messageStream, callback) {
  var errored = false;
  var objectMode = false;

  (0, _highland2.default)(messageStream).stopOnError(function (err) {
    // TODO: this does not seem to halt the stream properly, and make
    // the callback being fired twice. We need to get rid of the ugly
    // errored variable check.
    errored = true;
    callback(err);
  }).map(function (_ref) {
    var data = _ref.result.data;

    objectMode = !_lodash2.default.isArray(data);

    return data;
  }).sequence().toArray(function (results) {
    if (!errored) {
      callback(null, objectMode ? results[0] : results);
    }
  });
}

exports.default = defaultExecuteHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9leGVjdXRlSGFuZGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7QUFHQSxTQUFTLHFCQUFULENBQStCLGFBQS9CLEVBQThDLFFBQTlDLEVBQXdEO0FBQ3RELE1BQUksVUFBVSxLQUFWLENBRGtEO0FBRXRELE1BQUksYUFBYSxLQUFiLENBRmtEOztBQUl0RCwwQkFBUyxhQUFULEVBQ0csV0FESCxDQUNlLFVBQUMsR0FBRCxFQUFTOzs7O0FBSXBCLGNBQVUsSUFBVixDQUpvQjtBQUtwQixhQUFTLEdBQVQsRUFMb0I7R0FBVCxDQURmLENBUUcsR0FSSCxDQVFPLGdCQUEwQjtRQUFiLFlBQVYsT0FBVSxLQUFhOztBQUM3QixpQkFBYSxDQUFDLGlCQUFFLE9BQUYsQ0FBVSxJQUFWLENBQUQsQ0FEZ0I7O0FBRzdCLFdBQU8sSUFBUCxDQUg2QjtHQUExQixDQVJQLENBYUcsUUFiSCxHQWNHLE9BZEgsQ0FjVyxVQUFDLE9BQUQsRUFBYTtBQUNwQixRQUFJLENBQUMsT0FBRCxFQUFVO0FBQ1osZUFBUyxJQUFULEVBQWUsYUFBYSxRQUFRLENBQVIsQ0FBYixHQUEwQixPQUExQixDQUFmLENBRFk7S0FBZDtHQURPLENBZFgsQ0FKc0Q7Q0FBeEQ7O2tCQXlCZSIsImZpbGUiOiJleGVjdXRlSGFuZGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBoaWdobGFuZCBmcm9tICdoaWdobGFuZCc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuXG5cbmZ1bmN0aW9uIGRlZmF1bHRFeGVjdXRlSGFuZGxlcihtZXNzYWdlU3RyZWFtLCBjYWxsYmFjaykge1xuICBsZXQgZXJyb3JlZCA9IGZhbHNlO1xuICBsZXQgb2JqZWN0TW9kZSA9IGZhbHNlO1xuXG4gIGhpZ2hsYW5kKG1lc3NhZ2VTdHJlYW0pXG4gICAgLnN0b3BPbkVycm9yKChlcnIpID0+IHtcbiAgICAgIC8vIFRPRE86IHRoaXMgZG9lcyBub3Qgc2VlbSB0byBoYWx0IHRoZSBzdHJlYW0gcHJvcGVybHksIGFuZCBtYWtlXG4gICAgICAvLyB0aGUgY2FsbGJhY2sgYmVpbmcgZmlyZWQgdHdpY2UuIFdlIG5lZWQgdG8gZ2V0IHJpZCBvZiB0aGUgdWdseVxuICAgICAgLy8gZXJyb3JlZCB2YXJpYWJsZSBjaGVjay5cbiAgICAgIGVycm9yZWQgPSB0cnVlO1xuICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICB9KVxuICAgIC5tYXAoKHsgcmVzdWx0OiB7wqBkYXRhIH0gfSkgPT4ge1xuICAgICAgb2JqZWN0TW9kZSA9ICFfLmlzQXJyYXkoZGF0YSk7XG5cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0pXG4gICAgLnNlcXVlbmNlKClcbiAgICAudG9BcnJheSgocmVzdWx0cykgPT4ge1xuICAgICAgaWYgKCFlcnJvcmVkKSB7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIG9iamVjdE1vZGUgPyByZXN1bHRzWzBdIDogcmVzdWx0cyk7XG4gICAgICB9XG4gICAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmF1bHRFeGVjdXRlSGFuZGxlcjtcbiJdfQ==