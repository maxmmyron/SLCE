import { assert } from "../util/asserts";

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
    this.x += vector.x;
    this.y += vector.y;

    return this;
  }

  subtract = (vector: Vector2D): Vector2D => {
    this.x -= vector.x;
    this.y -= vector.y;

    return this;
  }

  multiply = (scalar: number): Vector2D => {
    this.x *= scalar;
    this.y *= scalar;

    return this;
  }

  divide = (scalar: number): Vector2D => {
    assert(scalar !== 0, "Cannot divide by zero");

    this.x /= scalar;
    this.y /= scalar

    return this;
  }

  getMagnitude = (): number => Math.sqrt(this.x * this.x + this.y * this.y);

  normalize = (): Vector2D => {
    this.divide(this.getMagnitude());

    return this;
  }

  getDot = (vector: Vector2D): number => this.x * vector.x + this.y * vector.y;

  getCross = (vector: Vector2D): number => this.x * vector.y - this.y * vector.x;

  rotate = (angle: number): Vector2D => {
    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);

    const x = this.x * cosAngle - this.y * sinAngle;
    const y = this.x * sinAngle + this.y * cosAngle;

    this.x = x;
    this.y = y;

    return this;
  }
}
