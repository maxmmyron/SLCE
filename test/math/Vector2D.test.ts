import { describe, it, expect, expectTypeOf, vi } from "vitest";
import Vector2D from "@/math/Vector2D";

describe("Vector2D", () => {
  it("is instantiable", () => {});

  describe("constructor", () => {
    it("can be constructed with no arguments", () => {
      const vector = new Vector2D();

      expect(vector.x).toBe(0);
      expect(vector.y).toBe(0);
    });

    it("can be constructed with two arguments", () => {
      const vector = new Vector2D(1, 2);

      expect(vector.x).toBe(1);
      expect(vector.y).toBe(2);
    });
  });

  describe("unary operations", () => {
    it("can get the magnitude", () => {
      const vector = new Vector2D(1, 2);

      expect(vector.magnitude).toBe(2.23606797749979);
    });

    it("can be normalized", () => {
      const vector = new Vector2D(1, 2);

      expect(vector.normalize().toObject()).toEqual({ x: 0.4472135954999579, y: 0.8944271909999159 });
    });

    it("can be rotated", () => {
      const vector = new Vector2D(1, 2);

      expect(vector.rotate(Math.PI * .5).floor().toObject()).toEqual({ x: -2, y: 1 });
    });

    it("can be converted to a string", () => {
      const vector = new Vector2D(1, 2);

      expect(vector.toString()).toBe("x: 1, y: 2");
    });

    it("can be converted to an object", () => {
      const vector = new Vector2D(1, 2);

      expect(vector.toObject()).toEqual({ x: 1, y: 2 });
    });

    it("can be floored", () => {
      const vector = new Vector2D(1.5, 2.5);

      expect(vector.floor().toObject()).toEqual({ x: 1, y: 2 });
    });

    it("can be ceiled", () => {
      const vector = new Vector2D(1.5, 2.5);

      expect(vector.ceil().toObject()).toEqual({ x: 2, y: 3 });
    });
  });

  describe('binary operations', () => {
    it('can be added', () => {
      const vector1 = new Vector2D(1, 2);
      const vector2 = new Vector2D(3, 4);

      expect(vector1.add(vector2).toObject()).toEqual({ x: 4, y: 6 });
    });

    it('can be subtracted', () => {
      const vector1 = new Vector2D(1, 2);
      const vector2 = new Vector2D(3, 4);

      expect(vector1.subtract(vector2).toObject()).toEqual({ x: -2, y: -2 });
    });

    it('can be multiplied', () => {
      const vector = new Vector2D(1, 2);

      expect(vector.multiply(2).toObject()).toEqual({ x: 2, y: 4 });
    });

    it('can be divided', () => {
      const vector = new Vector2D(1, 2);

      expect(vector.divide(2).toObject()).toEqual({ x: 0.5, y: 1 });
    });

    it('can be dotted', () => {
      const vector1 = new Vector2D(1, 2);
      const vector2 = new Vector2D(3, 4);

      expect(vector1.dot(vector2)).toBe(11);
    });

    it('can be crossed', () => {
      const vector1 = new Vector2D(1, 2);
      const vector2 = new Vector2D(3, 4);

      expect(vector1.cross(vector2)).toBe(-2);
    });

    it('can be compared', () => {
      const vector1 = new Vector2D(1, 2);
      const vector2 = new Vector2D(3, 4);

      expect(vector1.equals(vector2)).toBe(false);
    });
  });
});
