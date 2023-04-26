import { describe, it, expect, vi } from "vitest";
import { createMockEngineInstance } from "../mocks/Engine.mock";
import Engine from "@/core/Engine";

describe("Engine", () => {
  describe("constructor", () => {
    it("should create an instance of Engine", () => {
      const {engine} = createMockEngineInstance();

      expect(engine).toBeDefined();
      expect(engine).toBeInstanceOf(Engine);
    });

    it("should create an instance of Engine with options", () => {
      const {engine} = createMockEngineInstance({
        isDebugEnabled: true,
      });

      expect(engine).toBeDefined();
      expect(engine.parameterGUI.isEnabled).toBe(true);
    });
  });

  describe("starting", () => {
    it("preloads actors", async () => {
      const { engine, actor } = createMockEngineInstance();

      actor.preload = vi.fn(() => new Promise<void>((resolve) => resolve()));
      const preloadSpy = vi.spyOn(actor, "preload");

      await engine.start();

      expect(preloadSpy).toHaveBeenCalled();
    });

    it("throws an error when preloading after engine start", async () => {
      const { engine } = createMockEngineInstance();

      await engine.start();

      expect(() => engine.start()).rejects.toThrowError();
    });
  });

  describe("event callbacks", () => {
    it("can be registered", () => {
      const { engine } = createMockEngineInstance();
      engine.registerEventCallback("onmousedown", () => {});

      expect(engine.eventHandler.getRegisteredCallbacks("onmousedown").length).toBe(1);
    });
    it("can be unregistered", () => {
      const { engine } = createMockEngineInstance();
      let callback = () => {};
      engine.registerEventCallback("onmousedown", callback);
      engine.unregisterEventCallback("onmousedown", callback);

      expect(engine.eventHandler.getRegisteredCallbacks("onmousedown").length).toBe(0);
    });
  });
});
