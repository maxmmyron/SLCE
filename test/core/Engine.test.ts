import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createMockEngineInstance } from "../mocks/Engine.mock";

describe("Engine", () => {
  let engine: Engineable, actor: Elementable;

  beforeEach(() => {
    let instances = createMockEngineInstance();
    engine = instances.engine;
    actor = instances.actor;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create an instance of Engine", () => {
      expect(engine).toBeDefined();
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
      actor.preload = vi.fn(() => new Promise<void>((resolve) => resolve()));
      const preloadSpy = vi.spyOn(actor, "preload");

      await engine.start();
      engine.isPaused = true;

      expect(preloadSpy).toHaveBeenCalled();
    });

    it("throws an error when preloading after engine start", async () => {
      actor.preload = vi.fn(() => new Promise<void>((resolve) => resolve()));

      await engine.start();

      expect(() => engine.start()).rejects.toThrowError();
    });
  });

  describe("event callbacks", () => {
    it("can be registered", () => {
      engine.registerEventCallback("onmousedown", () => {});

      expect(engine.eventHandler.getRegisteredCallbacks("onmousedown").length).toBe(1);
    });

    it("can be unregistered", () => {
      let callback = () => {};
      engine.registerEventCallback("onmousedown", callback);
      engine.unregisterEventCallback("onmousedown", callback);

      expect(engine.eventHandler.getRegisteredCallbacks("onmousedown").length).toBe(0);
    });
  });
});
