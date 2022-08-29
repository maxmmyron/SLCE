/**
 * A series of helper functions for for working with vectors
 */

import { assertIsNumber, assertIsVector } from "../util/Asserts";

/**
 * @typedef {Object} Vector
 * @property {number} x - the x component of the vector
 * @property {number} y - the y component of the vector
 */

/**
 * Checks if all vectors passed are vectors before performing an operation
 *
 * @param {Array} vectors - an array of potential vectors to check
 * @param {*} op - the operation to be performed on the vectors upon success
 * @returns the result of the operation on the vectors
 *
 * @throws {TypeError} if any of the vectors are not vectors
 */
const resolveVector = (vectors, op) => {
  // check if each element is a vector before performing operation
  if (vectors.every(assertIsVector)) vectors.map((vector) => op(vector));
  else reject(new TypeError("Not all elements are vectors"));
};

/**
 * creates a vector in the form of {x, y}
 *
 * @param {Number} x - optional x component, defaults to 0
 * @param {Number} y - optional y component, defaults to 0
 * @return {Object} a new object in the form of {x, y}
 *
 * @example
 * const v = vec(1, 2);
 * v.x // 1
 * v.y // 2
 *
 * @example
 * const v = vec();
 * v.x // 0
 * v.y // 0
 *
 * @example
 * const v = vec(1);
 * v.x // 1
 * v.y // 0
 */
export const vec = (x = 0, y = 0) => {
  // assert that x and y are numbers
  // assertIsNumber(x);
  // assertIsNumber(y);

  return { x: x, y: y };
};

/**
 * adds two vectors together
 *
 * @param a - A vector
 * @param b - The vector to add to A
 * @return {Object} the sum of the two vectors
 */
export const add = (a, b) => vec(a.x + b.x, a.y + b.y);
//resolveVector([a, b], (a, b) => vec(a.x + b.x, a.y + b.y));

/**
 * subtracts two vectors
 *
 * @param a - A vector
 * @param b - The vector to subtract from A
 * @return {Object} the difference of A and B
 */
export const sub = (a, b) => vec(a.x - b.x, a.y - b.y);
// resolveVector([a, b], (a, b) => vec(a.x - b.x, a.y - b.y));

/**
 * multiplies a vector by a scalar
 *
 * @param a - A vector
 * @param s - The scalar to multiply A by
 * @return {Object} the product of A and s
 *
 * @throws {Error} if s is not a number
 */
export const mult = (a, s) => {
  //assertIsNumber(s);

  return vec(a.x * s, a.y * s);
  // resolveVector(a, a => vec(a.x * s, a.y * s));
};

/**
 * divides a vector by a scalar
 *
 * @param a - A vector
 * @param s - The scalar to divide A by
 * @return {Object} the quotient of A and s
 *
 * @throws {TypeError} if s is not a number
 * @throws {Error} if s is zero
 */
export const div = (a, s) => {
  assertIsNumber(s);

  if (s === 0) throw new Error("Cannot divide by 0");

  return vec(a.x / s, a.y / s);
  // resolveVector(a, a => vec(a.x / s, a.y / s));
};

/**
 * rotates a vector by an angle
 *
 * @param a - A vector
 * @param angle - The angle to rotate A by in radians
 * @return {Object} the rotated vector
 *
 * @throws {Error} if angle is not a number
 */
export const rotate = (a, angle) => {
  if (typeof angle === Number)
    return resolveVector(a, (a) => {
      const s = Math.sin(angle);
      const c = Math.cos(angle);

      return vec(a.x * c - a.y * s, a.x * s + a.y * c);
    });
  else throw new Error("angle must be a number");
};

/**
 * returns the magnitude of a vector
 *
 * @param a - A vector
 * @return {Number} - the magnitude of A
 */
export const mag = (a) => Math.sqrt(a.x * a.x + a.y * a.y);
//resolveVector(a, a => Math.sqrt(a.x * a.x + a.y * a.y));

/**
 * normalizes a vector
 *
 * @param a - vector to normalize
 * @return {Object} - the normalized vector
 */
export const norm = (a) => resolveVector(a, (a) => div(a, mag(a)));

/**
 * calculates the dot product of two vectors
 *
 * @param a - A vector
 * @param b - The vector to dot with A
 * @return {Number} - the dot product of A and B
 */
export const dot = (a, b) =>
  resolveVector([a, b], (a, b) => a.x * b.x + a.y * b.y);

/**
 * calculates the cross product of two vectors
 *
 * @param a - A vector
 * @param b - The vector to cross with A
 * @return {Number} - the cross product of A and B
 */
export const cross = (a, b) =>
  resolveVector([a, b], (a, b) => a.x * b.y - a.y * b.x);
