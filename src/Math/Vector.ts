import { assert } from "../util/asserts";

/**
 * creates a vector in the form of {x, y}
 *
 * @param {number} x - optional x component, defaults to 0
 * @param {number} y - optional y component, defaults to 0
 * @return {Vector} A Vector with the specified components
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
export const vec = (x: number = 0, y: number = 0): Vector => {
  return { x, y };
};

/**
 * adds two vectors together
 *
 * @param {Vector} a A vector
 * @param {Vector} b The vector to add to A
 * @return {Vector} the sum of the two vectors
 */
export const add = (a: Vector, b: Vector): Vector => vec(a.x + b.x, a.y + b.y);

/**
 * subtracts two vectors
 *
 * @param {Vector} a A vector
 * @param {Vector} b The vector to subtract from A
 * @return {Vector} The vector consisting of the difference between A and B
 */
export const sub = (a: Vector, b: Vector): Vector => vec(a.x - b.x, a.y - b.y);

/**
 * multiplies a vector by a scalar
 *
 * @param {Vector} a A vector
 * @param {number} s The scalar to multiply A by
 * @return {Vector} A vector consisting of the components of A multiplied by s
 */
export const mult = (a: Vector, s: number): Vector => vec(a.x * s, a.y * s);


/**
 * divides a vector by a scalar
 *
 * @param {Vector} a A vector
 * @param {number} s The scalar to divide A by
 * @return {Vector} A vector consisting of the components of A divided by s
 *
 * @throws {Error} if s is zero
 */
export const div = (a: Vector, s: number): Vector => {
  assert(s !== 0, "Cannot divide by zero");

  return vec(a.x / s, a.y / s);
};

/**
 * rotates a vector by an angle
 *
 * @param {Vector} a A vector
 * @param {number} angle The angle to rotate A by in radians
 * @return {Vector} the rotated vector
 */
export const rotate = (a: Vector, angle: number): Vector => {
  const sinAngle = Math.sin(angle);
  const cosAngle = Math.cos(angle);

  return vec(a.x * cosAngle - a.y * sinAngle, a.x * sinAngle + a.y * cosAngle);
};

/**
 * returns the magnitude of a vector
 *
 * @param {Vector} a A vector
 * @return {number} the magnitude of A
 */
export const mag = (a: Vector): number => Math.sqrt(a.x * a.x + a.y * a.y);

/**
 * normalizes a vector
 *
 * @param {Vector} a vector to normalize
 * @return {Vector} the normalized vector
 */
export const norm = (a: Vector): Vector => div(a, mag(a));

/**
 * calculates the dot product of two vectors
 *
 * @param {Vector} a - A vector
 * @param {Vector} b - The vector to dot with A
 * @return {number} - the dot product of A and B
 */
export const dot = (a: Vector, b: Vector): number => a.x * b.x + a.y * b.y;

/**
 * calculates the cross product of two vectors
 *
 * @param {Vector} a - A vector
 * @param {Vector} b - The vector to cross with A
 * @return {number} - the cross product of A and B
 */
export const cross = (a: Vector, b: Vector): number => a.x * b.y - a.y * b.x;
