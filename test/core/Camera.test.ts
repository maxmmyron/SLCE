import { describe, it, expect } from "vitest";
import Camera from "@/core/Camera";
import { createMockEngineInstance } from "../mocks/Engine.mock";
import Vector2D from "@/math/Vector2D";

describe("Camera", () => {
  describe("constructor", () => {
    it("should create an instance of Camera", () => {
      const { engine } = createMockEngineInstance();
      const camera = new Camera("test", engine);

      expect(camera).toBeDefined();
      expect(camera).toBeInstanceOf(Camera);
    });

    it("should create an instance of Camera with options", () => {
      const { engine } = createMockEngineInstance();
      const camera = new Camera("test", engine, {
        position: new Vector2D(1,1),
        rotation: new Vector2D(1,1),
        zoom: 2,
      });

      expect(camera).toBeDefined();
      expect(camera.position.toObject()).toEqual({x: 1, y: 1});
      expect(camera.rotation.toObject()).toEqual({x: 1, y: 1});
      expect(camera.zoom).toBe(2);
    });
  });

  describe("event callbacks", () => {
    it("can be registered", () => {
      const { engine } = createMockEngineInstance();
      const camera = new Camera("test", engine, {});

      camera.registerEventCallback("onmousedown", () => { });

      expect(engine.eventHandler.getRegisteredCallbacks("onmousedown").length).toBe(1);
      expect(engine.eventHandler.getRegisteredCallbacks("whilemousedown").length).toBe(1);
    });
    it("can be unregistered", () => {
      const { engine } = createMockEngineInstance();
      const camera = new Camera("test", engine, {});

      let callback = () => { };
      camera.registerEventCallback("onmousedown", callback);
      camera.unregisterEventCallback("onmousedown", callback);

      expect(engine.eventHandler.getRegisteredCallbacks("onmousedown").length).toBe(0);
    });
  });
});
