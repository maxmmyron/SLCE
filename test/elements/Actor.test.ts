import { describe, it, expect } from "vitest";
import Actor from "@/elements/Actor";
import { createMockEngine } from "../mocks/Engine.mock";
import Camera from "@/core/Camera";
import Vector2D from "@/math/Vector2D";
import Scene from "@/elements/Scene";

describe("Actor", () => {
  describe("constructor", () => {
    it("instantiates new scene", () => {
      const engine = createMockEngine();
      const scene = new Scene("scene", engine, new Camera("cam", engine));

      const actor = new Actor("test", scene);

      expect(actor.name).toBe("test");
      expect(actor.scene).toBe(scene);
    });

    it("has default properties when no properties are passed", () => {
      const engine = createMockEngine();
      const scene = new Scene("test", engine, new Camera("cam", engine));

      const actor = new Actor("test", scene);

      expect(actor.isGravityEnabled).toBe(true);
      expect(actor.isCollisionEnabled).toBe(true);
      expect(actor.isTextureEnabled).toBe(true);

      expect(actor.textureID).toBe("");
      expect(actor.textureFrame).toBe(0);
    });

    it("can be created with default properties", () => {
      const engine = createMockEngine();
      const scene = new Scene("test", engine, new Camera("cam", engine));


      const actor = new Actor("test", scene, {
        isGravityEnabled: false,
        position: new Vector2D(1, 2),
        rotation: Math.PI,
        scale: new Vector2D(4, 5),
      });

      expect(actor.isGravityEnabled).toBe(false);

      expect(actor.position.toObject()).toEqual({ x: 1, y: 2 });
      expect(actor.rotation).toBe(Math.PI);
      expect(actor.scale.toObject()).toEqual({ x: 4, y: 5 });
    });
  });
})
