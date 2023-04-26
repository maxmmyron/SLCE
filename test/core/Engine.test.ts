import { describe, it, expect } from "vitest";
import { createMockEngine } from "../mocks/Engine.mock";
import Engine from "@/core/Engine";

describe("Engine", () => {
  describe("constructor", () => {
    it("should create an instance of Engine", () => {
      const engine = createMockEngine();
      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(Engine);
    });


  });
});
