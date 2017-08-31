import _ from 'lodash';

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
export function buildQueryFromSignature(rawScript = '', rawBindings) {
  const { gremlin = rawScript, bindings = rawBindings } = rawScript;

  return {
    gremlin,
    // Remap 'undefined' bindings as 'null' values that would otherwise
    // result in missing/unbound variables in the Gremlin script execution
    // context.
    bindings: _.mapValues(
      { ...bindings, ...rawBindings },
      value => (_.isUndefined(value) ? null : value),
    ),
  };
}
