import {
  add,
  cross,
  div,
  dot,
  mag,
  mult,
  norm,
  rotate,
  sub,
  vec,
} from "../src/Math/Vector";

const a = vec(1, 2);
const b = vec(3, 4);
const nv = null;
const s = 3;

console.log(add(a, b));

console.log(sub(a, b));

console.log(mult(nv, s));

console.log(div(nv, s));

console.log(rotate(a, Math.PI / 2));

console.log(mag(a));

console.log(norm(a));

console.log(dot(a, b));

console.log(cross(a, b));
