import { describe, it, expect } from "vitest";
import Camera from "@/core/Camera";
import { createMockEngine } from "../mocks/Engine.mock";

describe("Camera", () => {
  describe("constructor", () => {
    it("should create an instance of Camera", () => {
      const engine = createMockEngine();
      const camera = new Camera("test", engine);
      expect(camera).toBeDefined();
      expect(camera).toBeInstanceOf(Camera);
    });
  });
});
