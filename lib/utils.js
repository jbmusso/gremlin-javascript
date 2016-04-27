'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.extractFunctionBody = extractFunctionBody;
exports.buildQueryFromSignature = buildQueryFromSignature;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get the inner function body from a function.toString() representation
 *
 * @param {Function}
 * @return {String}
 */
function extractFunctionBody(fn) {
  var body = fn.toString();
  var trimmedBody = body.substring(body.indexOf('{') + 1, body.lastIndexOf('}'));

  return trimmedBody;
};

/**
 * Given optional and polymorphic arguments, return an object with a raw
 * 'gremlin' string and optional 'bindings' object.
 * When supplying a query object as first parameter, any bindings supplied
 * as the last parameter will be shallow-merged.
 *
 * @param {String|Object|Function} rawScript
 * @param {Object} rawBindings
 * @return {Object}: { gremlin<String>, bindings<Object> }
 */
function buildQueryFromSignature() {
  var rawScript = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
  var rawBindings = arguments[1];

  if (typeof rawScript === 'function') {
    return {
      gremlin: extractFunctionBody(rawScript),
      bindings: rawBindings
    };
  }

  var _rawScript$gremlin = rawScript.gremlin;
  var gremlin = _rawScript$gremlin === undefined ? rawScript : _rawScript$gremlin;
  var _rawScript$bindings = rawScript.bindings;
  var bindings = _rawScript$bindings === undefined ? rawBindings : _rawScript$bindings;


  return {
    gremlin: gremlin,
    // Remap 'undefined' bindings as 'null' values that would otherwise
    // result in missing/unbound variables in the Gremlin script execution
    // context.
    bindings: _lodash2.default.mapValues(_extends({}, bindings, rawBindings), function (value) {
      return _lodash2.default.isUndefined(value) ? null : value;
    })
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztRQVFnQjtRQWlCQTs7QUF6QmhCOzs7Ozs7Ozs7Ozs7QUFRTyxTQUFTLG1CQUFULENBQTZCLEVBQTdCLEVBQWlDO0FBQ3RDLE1BQU0sT0FBTyxHQUFHLFFBQUgsRUFBUCxDQURnQztBQUV0QyxNQUFNLGNBQWMsS0FBSyxTQUFMLENBQWUsS0FBSyxPQUFMLENBQWEsR0FBYixJQUFvQixDQUFwQixFQUF1QixLQUFLLFdBQUwsQ0FBaUIsR0FBakIsQ0FBdEMsQ0FBZCxDQUZnQzs7QUFJdEMsU0FBTyxXQUFQLENBSnNDO0NBQWpDOzs7Ozs7Ozs7Ozs7QUFpQkEsU0FBUyx1QkFBVCxHQUE4RDtNQUE3QixrRUFBWSxrQkFBaUI7TUFBYiwyQkFBYTs7QUFDbkUsTUFBSSxPQUFPLFNBQVAsS0FBcUIsVUFBckIsRUFBaUM7QUFDbkMsV0FBTztBQUNMLGVBQVMsb0JBQW9CLFNBQXBCLENBQVQ7QUFDQSxnQkFBVSxXQUFWO0tBRkYsQ0FEbUM7R0FBckM7OzJCQVVJLFVBRkYsUUFUaUU7TUFTakUsNkNBQVUsK0JBVHVEOzRCQVcvRCxVQURGLFNBVmlFO01BVWpFLCtDQUFXLGtDQVZzRDs7O0FBYW5FLFNBQU87QUFDTCxvQkFESzs7OztBQUtMLGNBQVUsaUJBQUUsU0FBRixjQUFpQixVQUFhLFlBQTlCLEVBQTZDLFVBQUMsS0FBRDthQUFXLGlCQUFFLFdBQUYsQ0FBYyxLQUFkLElBQXVCLElBQXZCLEdBQThCLEtBQTlCO0tBQVgsQ0FBdkQ7R0FMRixDQWJtRTtDQUE5RCIsImZpbGUiOiJ1dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbi8qKlxuICogR2V0IHRoZSBpbm5lciBmdW5jdGlvbiBib2R5IGZyb20gYSBmdW5jdGlvbi50b1N0cmluZygpIHJlcHJlc2VudGF0aW9uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn1cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RGdW5jdGlvbkJvZHkoZm4pIHtcbiAgY29uc3QgYm9keSA9IGZuLnRvU3RyaW5nKCk7XG4gIGNvbnN0IHRyaW1tZWRCb2R5ID0gYm9keS5zdWJzdHJpbmcoYm9keS5pbmRleE9mKCd7JykgKyAxLCBib2R5Lmxhc3RJbmRleE9mKCd9JykpO1xuXG4gIHJldHVybiB0cmltbWVkQm9keTtcbn07XG5cbi8qKlxuICogR2l2ZW4gb3B0aW9uYWwgYW5kIHBvbHltb3JwaGljIGFyZ3VtZW50cywgcmV0dXJuIGFuIG9iamVjdCB3aXRoIGEgcmF3XG4gKiAnZ3JlbWxpbicgc3RyaW5nIGFuZCBvcHRpb25hbCAnYmluZGluZ3MnIG9iamVjdC5cbiAqIFdoZW4gc3VwcGx5aW5nIGEgcXVlcnkgb2JqZWN0IGFzIGZpcnN0IHBhcmFtZXRlciwgYW55IGJpbmRpbmdzIHN1cHBsaWVkXG4gKiBhcyB0aGUgbGFzdCBwYXJhbWV0ZXIgd2lsbCBiZSBzaGFsbG93LW1lcmdlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R8RnVuY3Rpb259IHJhd1NjcmlwdFxuICogQHBhcmFtIHtPYmplY3R9IHJhd0JpbmRpbmdzXG4gKiBAcmV0dXJuIHtPYmplY3R9OiB7IGdyZW1saW48U3RyaW5nPiwgYmluZGluZ3M8T2JqZWN0PiB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFF1ZXJ5RnJvbVNpZ25hdHVyZShyYXdTY3JpcHQgPSAnJywgcmF3QmluZGluZ3MpIHtcbiAgaWYgKHR5cGVvZiByYXdTY3JpcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZ3JlbWxpbjogZXh0cmFjdEZ1bmN0aW9uQm9keShyYXdTY3JpcHQpLFxuICAgICAgYmluZGluZ3M6IHJhd0JpbmRpbmdzXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IHtcbiAgICBncmVtbGluID0gcmF3U2NyaXB0LFxuICAgIGJpbmRpbmdzID0gcmF3QmluZGluZ3NcbiAgfSA9IHJhd1NjcmlwdDtcblxuICByZXR1cm4ge1xuICAgIGdyZW1saW4sXG4gICAgLy8gUmVtYXAgJ3VuZGVmaW5lZCcgYmluZGluZ3MgYXMgJ251bGwnIHZhbHVlcyB0aGF0IHdvdWxkIG90aGVyd2lzZVxuICAgIC8vIHJlc3VsdCBpbiBtaXNzaW5nL3VuYm91bmQgdmFyaWFibGVzIGluIHRoZSBHcmVtbGluIHNjcmlwdCBleGVjdXRpb25cbiAgICAvLyBjb250ZXh0LlxuICAgIGJpbmRpbmdzOiBfLm1hcFZhbHVlcyh7IC4uLmJpbmRpbmdzLCAuLi5yYXdCaW5kaW5ncyB9LCAodmFsdWUpID0+IF8uaXNVbmRlZmluZWQodmFsdWUpID8gbnVsbCA6IHZhbHVlKVxuICB9O1xufVxuIl19