/**
 * A series of functions that assert a value is of a certain type
 */

/**
 * asserts that value is a valid number
 * @param {*} v - value to test
 * @throws {TypeError} if value is not a number
 *
 * @returns {Number} the value if it is a number, otherwise throws an error
 *
 * @example
 * assertIsNumber(1); // true
 * assertIsNumber("1"); // true
 * assertIsNumber(1.0); // true
 * assertIsNumber(NaN); // false
 * assertIsNumber(Infinity); // true
 * assertIsNumber(undefined); // false
 */
export const assertIsNumber = (v) => {
  if (isNaN(parseFloat(v)))
    throw new TypeError(`Error asserting number: ${v} is not a number`);

  return v;
};

/**
 * Asserts that value is a valid vector containing 2 numbers
 * @param {*} v - value to assert is a vector
 * @throws {TypeError} if value is not a vector\
 *
 * @returns {Vector} the value if it is a vector, otherwise throws an error
 */
export const assertIsVector = (v) => {
  // ensure n is not null
  if (v === null) throw new TypeError("Error asserting vector: value is null");

  // ensure n is an object with only 2 properties
  if (!(typeof v === "object" && Object.values(v).length === 2))
    throw new TypeError(
      "Error asserting vector: value is not of type Object with 2 properties"
    );

  // ensure n contains properties x and y, and that they are numbers
  if (
    !(
      Object.hasOwn(v, "x") &&
      Object.hasOwn(v, "y") &&
      typeof v.x === "number" &&
      typeof v.y === "number"
    )
  )
    throw new TypeError(
      "Error asserting vector: value does not contain properties x and y with values of type number"
    );

  return v;
};
