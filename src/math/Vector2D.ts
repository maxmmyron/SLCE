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

  add = (vector: Vector2D): Vector2D => {
    return new Vector2D(this.x + vector.x, this.y + vector.y);
  }

  subtract = (vector: Vector2D): Vector2D => {
    return new Vector2D(this.x - vector.x, this.y - vector.y);
  }

  multiply = (scalar: number): Vector2D => {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  divide = (scalar: number): Vector2D => {
    if(scalar === 0) throw new RangeError("Vector divide scalar cannot be 0.");

    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize = (): Vector2D => {
    return this.divide(this.magnitude);
  }

  dot = (vector: Vector2D): number => this.x * vector.x + this.y * vector.y;

  cross = (vector: Vector2D): number => this.x * vector.y - this.y * vector.x;

  rotate = (radians: number): Vector2D => {
    const sinAngle = Math.sin(radians);
    const cosAngle = Math.cos(radians);

    const x = this.x * cosAngle - this.y * sinAngle;
    const y = this.x * sinAngle + this.y * cosAngle;

    return new Vector2D(x, y);
  }

  equals = (vector: Vector2D): boolean => this.x === vector.x && this.y === vector.y;

  toString = (): string => `x: ${this.x}, y: ${this.y}`

  toObject = (): Object => ({ x: this.x, y: this.y });

  floor = (): Vector2D => new Vector2D(Math.floor(this.x), Math.floor(this.y));

  ceil = (): Vector2D => new Vector2D(Math.ceil(this.x), Math.ceil(this.y));
}
