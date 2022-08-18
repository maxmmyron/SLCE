/**
 * A series of helper functions for for working with vectors
 */

/**
 * creates a vector in the form of {x, y}
 * @param {Number} x - optional x component
 * @param {Number} y - optional y component
 * @return {Object} - a vector in the form of {x, y}
 */
export const vec = (x = 0, y = 0) => new Object({x: x, y: y}); 

/**
 * adds two vectors together
 * @param a - A vector
 * @param b - The vector to add to A
 */
export const add = (a, b) => vec(a.x + b.x, a.y + b.y);

/**
 * subtracts two vectors
 * @param a - A vector
 * @param b - The vector to subtract from A
 * @return {Object} - the difference of A and B
 */
export const sub = (a, b) => vec(a.x - b.x, a.y - b.y);

/**
 * multiplies a vector by a scalar
 * @param a - A vector
 * @param s - The scalar to multiply A by
 * @return {Object} - the product of A and s
 */
export const mult = (a, s) => vec(a.x * s, a.y * s);

/**
 * divides a vector by a scalar
 * @param a - A vector
 * @param s - The scalar to divide A by
 * @return {Object} - the quotient of A and s
 * @throws {Error} - if s is 0
 */
export const div = (a, s) => {
  if (s === 0) {
    throw new Error("Cannot divide by 0");
  }
  return vec(a.x / s, a.y / s);
}

/**
 * rotates a vector by an angle
 * @param a - A vector
 * @param angle - The angle to rotate A by in radians
 */
export const rotate = (a, angle) => {
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  return vec(a.x * c - a.y * s, a.x * s + a.y * c);
}

/**
 * gets the magnitude of a vector
 * @param a - A vector
 * @return {Number} - the magnitude of A
 */
export const mag = (a) => Math.sqrt(a.x * a.x + a.y * a.y);

/**
 * normalizes a vector
 * @param a - A vector
 * @return {Object} - the normalized vector
 */
export const norm = (a) => div(a, mag(a));

/**
 * gets the dot product of two vectors
 * @param a - A vector
 * @param b - The vector to dot with A
 * @return {Number} - the dot product of A and B
 */
export const dot = (a, b) => a.x * b.x + a.y * b.y;

/**
 * gets the cross product of two vectors
 * @param a - A vector
 * @param b - The vector to cross with A
 * @return {Number} - the cross product of A and B
 */
export const cross = (a, b) => a.x * b.y - a.y * b.x;