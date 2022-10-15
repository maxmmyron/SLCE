/**
 * Asserts that a provided conditional is true. If not, throws an error.
 *
 * @param {*} conditional conditional to assert is true
 * @param {string} message (optional) message to display if conditional is false
 * @param {ErrorConstructor} errorType (optional) type of error to throw if conditional is false
 *
 * @returns {boolean} true if conditional is true
 *
 * @throws {Error} conditional should evaluate to true
 */
export const assert = (condition: any, message: string = null, errorType: ErrorConstructor = Error) => {
  message = message || 'Assertion failed';

  if (!condition)
    throw new errorType(`Error asserting condition: ${message}`);

  return true;
};
