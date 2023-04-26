import { describe, it, expect, vitest } from "vitest";
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
    it("preloads actors", () => {
      const { engine, actor } = createMockEngineInstance();

      actor.preload = vitest.fn();
      const preloadSpy = vitest.spyOn(actor, "preload");

      engine.start().then(() => {
        expect(false).toBe(true);
        expect(preloadSpy).toHaveBeenCalled();
      })
    });

    it("throws an error when preloading after engine start", async () => {
      const { engine } = createMockEngineInstance();

      await engine.start();

      expect(() => engine.start()).rejects.toThrowError();
    });
  });

  describe("events", () => {
    describe("custom event callbacks", () => {
      it("can be registered", () => {});
      it("can be unregistered", () => {});
    });

    it("of type tick are emitted on tick cycle", () => {});

    it("of type render are emitted on mousedown", () => {});

    it("of type onresize are emitted on resize", () => {});
  });
});
