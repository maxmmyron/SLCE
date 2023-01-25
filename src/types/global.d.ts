interface Vectorable {
  x: number;
  y: number;

  add(vector: Vectorable): Vectorable;
  subtract(vector: Vectorable): Vectorable;
  multiply(scalar: number): Vectorable;
  divide(scalar: number): Vectorable;
  getMagnitude(): number;
  normalize(): Vectorable;
  getDot(vector: Vectorable): number;
  getCross(vector: Vectorable): number;
  rotate(angle: number): Vectorable;
}
