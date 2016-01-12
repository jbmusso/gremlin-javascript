/**
 * Get the inner function body from a function.toString() representation
 *
 * @param {Function}
 * @return {String}
 */
export function extractFunctionBody(fn) {
  const body = fn.toString();
  const trimmedBody = body.substring(body.indexOf('{') + 1, body.lastIndexOf('}'));

  return trimmedBody;
};

