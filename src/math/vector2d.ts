import { assert } from "../util/asserts.ts";

export default class Vector2D implements Vectorable {
  x: number;
  y: number;

  /**
   * Creates a new Vector2D instance.
   *
   * @param x x component, default to zero
   * @param y y component, default to zero
   */
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public add = (vector: Vector2D): Vector2D => {
    return new Vector2D(this.x + vector.x, this.y + vector.y);
  }

  subtract = (vector: Vector2D): Vector2D => {
    return new Vector2D(this.x - vector.x, this.y - vector.y);
  }

  multiply = (scalar: number): Vector2D => {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  divide = (scalar: number): Vector2D => {
    assert(scalar !== 0, "Cannot divide by zero");

    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  getMagnitude = (): number => Math.sqrt(this.x * this.x + this.y * this.y);

  normalize = (): Vector2D => {
    return this.divide(this.getMagnitude());
  }

  getDot = (vector: Vector2D): number => this.x * vector.x + this.y * vector.y;

  getCross = (vector: Vector2D): number => this.x * vector.y - this.y * vector.x;

  rotate = (angle: number): Vector2D => {
    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);

    const x = this.x * cosAngle - this.y * sinAngle;
    const y = this.x * sinAngle + this.y * cosAngle;

    return new Vector2D(x, y);
  }

  toString = (): string => `x: ${this.x}, y: ${this.y}`
}
