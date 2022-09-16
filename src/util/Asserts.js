/**
 * A series of functions that assert a value is of a certain type
 */

/**
 * asserts that value is a valid number
 * @param {*} val - value to assert is a number
 * @throws {TypeError} if value is not a number
 * 
 * @example
 * assertIsNumber(1); // true
 * assertIsNumber("1"); // true
 * assertIsNumber(1.0); // true
 * assertIsNumber(NaN); // false
 * assertIsNumber(Infinity); // false
 * assertIsNumber(undefined); // false
 */
export const assertIsNumber = val => {
  if(isNaN(parseFloat(val)))
    throw new TypeError(`Error asserting number: ${val} is not a number`);
}

/**
 * Asserts that value is a valid vector containing 2 numbers
 * @param {*} val - value to assert is a vector
 * @throws {TypeError} if value is not a vector
 */
export const assertIsVector = val => {
  // ensure n is not null
  if(val === null)
    throw new TypeError("Error asserting vector: value is null");

  // ensure n is an object with only 2 properties
  if(!(typeof(val) === "object" && Object.values(val).length === 2))
    throw new TypeError("Error asserting vector: value is not of type Object with 2 properties");

  // ensure n contains properties x and y, and that they are numbers
  if(!(Object.hasOwn(val, "x") && Object.hasOwn(val, "y") && typeof(val.x) === "number" && typeof(val.y) === "number"))
    throw new TypeError("Error asserting vector: value does not contain properties x and y with values of type number");
}