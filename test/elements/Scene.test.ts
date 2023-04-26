import { describe, it, expect } from "vitest";
import Scene from "@/elements/Scene";
import { createMockEngineInstance } from "../mocks/Engine.mock";
import Vector2D from "@/math/Vector2D";
import Actor from "@/elements/Actor";

describe("Scene", () => {
  describe("constructor", () => {
    it("instantiates new scene", () => {
      const { engine, camera } = createMockEngineInstance();
      const scene = new Scene("test", engine, camera);

      expect(scene.name).toBe("test");
    });

    it("has default properties when no properties are passed", () => {
      const { engine, camera } = createMockEngineInstance();
      const scene = new Scene("test", engine, camera);

      expect(scene.camera).toBe(camera);
      expect(scene.environment.background).toBe("transparent");
      expect(scene.environment.gravity.toObject()).toEqual({ x: 0, y: 0 });
    });

    it("can be created with default properties", () => {
      const { engine, camera } = createMockEngineInstance();
      const scene = new Scene("test", engine, camera, {
        background: "black",
        gravity: new Vector2D(1, 2)
      });

      expect(scene.camera).toBe(camera);
      expect(scene.environment.background).toBe("black");
      expect(scene.environment.gravity.toObject()).toEqual({ x: 1, y: 2 });
    });
  });

  describe("actors", () => {
    it("can be added to scene", () => {
      const {engine, camera} = createMockEngineInstance();
      const scene = new Scene("test", engine, camera);
      new Actor("test", scene);

      expect(scene.actors.size).toBe(1);
    });
  });
})
