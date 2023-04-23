interface Vectorable {
  x: number;
  y: number;

  add(vector: Vectorable): Vectorable;
  subtract(vector: Vectorable): Vectorable;
  multiply(scalar: number): Vectorable;
  divide(scalar: number): Vectorable;
  get magnitude(): number;
  normalize(): Vectorable;
  dot(vector: Vectorable): number;
  cross(vector: Vectorable): number;
  equals(vector: Vectorable): boolean;
  rotate(angle: number): Vectorable;
  toString(): string;
  toObject(): Object;
  floor(): Vectorable;
  ceil(): Vectorable;
}
