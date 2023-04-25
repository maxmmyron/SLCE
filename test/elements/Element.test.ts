import { describe, it, expect } from "vitest";
import Element from "@/elements/Element";
import { createMockEngine } from "../mocks/Engine.mock";
import Vector2D from "@/math/Vector2D";

describe("Element", () => {
  describe("constructor", () => {
    it("instantiates new element", () => {
      const engine = createMockEngine();
      const element = new Element("test", engine, {});
      expect(element.name).toBe("test");
    });

    it("has default properties when no properties are passed", () => {
      const engine = createMockEngine();
      const element = new Element("test", engine, {});

      expect(element.position.toObject()).toEqual({ x: 0, y: 0 });
      expect(element.velocity.toObject()).toEqual({ x: 0, y: 0 });
      expect(element.rotation).toEqual(0);
      expect(element.scale.toObject()).toEqual({ x: 1, y: 1 });
    });

    it("can be created with default properties", () => {
      const engine = createMockEngine();
      const element = new Element("test", engine, {
        position: new Vector2D(1, 2),
        velocity: new Vector2D(3, 4),
        rotation: Math.PI,
        scale: new Vector2D(7, 8)
      });

      expect(element.position.toObject()).toEqual({ x: 1, y: 2 });
      expect(element.velocity.toObject()).toEqual({ x: 3, y: 4 });
      expect(element.rotation).toEqual(Math.PI);
      expect(element.scale.toObject()).toEqual({ x: 7, y: 8 });
    });
  });

  describe("event callbacks", () => {
    it("can be registered", () => {
      const engine = createMockEngine();
      const element = new Element("test", engine, {});

      element.registerEventCallback("onmousedown", () => {});

      expect(engine.eventHandler.getRegisteredCallbacks("onmousedown").length).toBe(1);
    });

    it("can be unregistered", () => {
      const engine = createMockEngine();
      const element = new Element("test", engine, {});

      let callback = () => {};
      element.registerEventCallback("onmousedown", callback);
      element.unregisterEventCallback("onmousedown", callback);

      expect(engine.eventHandler.getRegisteredCallbacks("onmousedown").length).toBe(0);
    });
  })

});
