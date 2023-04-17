import { describe, it, expect, expectTypeOf, vi } from "vitest";
import EventHandler from "@/util/EventHandler";

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("EventHandler", () => {
  const canvas = document.createElement("canvas");

  it("is instantiable", () => {
    const eventHandler = new EventHandler(canvas);

    expect(eventHandler).toBeInstanceOf(EventHandler);
    expectTypeOf(eventHandler).toEqualTypeOf<EventHandler>();
  });

  describe("callback registry", () => {
    it("can register a callback", () => {
      const eventHandler = new EventHandler(canvas);

      eventHandler.registerEventCallback("onmousedown", () => {});

      expect(eventHandler.getEventCallbacks("onmousedown").length).toBe(1);
    });

    it("can register multiple callbacks", () => {
      const eventHandler = new EventHandler(canvas);

      eventHandler.registerEventCallback("onmousedown", () => {});
      eventHandler.registerEventCallback("onmousedown", () => {});

      expect(eventHandler.getEventCallbacks("onmousedown").length).toBe(2);
    });

    it("can unregister a callback", () => {
      const eventHandler = new EventHandler(canvas);

      let callback: EngineEventCallback<"onmousedown"> = () => {};

      eventHandler.registerEventCallback("onmousedown", callback);
      expect(eventHandler.getEventCallbacks("onmousedown").length).toBe(1);

      eventHandler.unregisterEventCallback("onmousedown", callback);
      expect(eventHandler.getEventCallbacks("onmousedown").length).toBe(0);
    });
  });

  describe("event queue", () => {
    it("can queue a simple event", () => {
      const eventHandler = new EventHandler(canvas);

      eventHandler.queueEvent("onrender", {type: "onrender", interpolationFactor: 0});

      expect(eventHandler.getQueuedEvents("onrender").length).toBe(1);
      expect(eventHandler.getQueuedEvents("onrender")[0].type).toBe("onrender");
      expect(eventHandler.getQueuedEvents("onrender")[0]).toEqual({
        type: "onrender",
        interpolationFactor: 0,
      });
    });

    it("can queue an event with a persistent dependent", () => {
      const eventHandler = new EventHandler(canvas);

      const mousedownPayload = { type: "onmousedown", x: 0, y: 0, button: 0 }
      eventHandler.queueEvent("onmousedown", mousedownPayload);

      expect(eventHandler.getQueuedEvents("onmousedown").length).toBe(1);
      expect(eventHandler.getQueuedEvents("onmousedown")[0].type).toBe("onmousedown");
      expect(eventHandler.getQueuedEvents("onmousedown")[0]).toEqual(mousedownPayload);

      expect(eventHandler.getQueuedEvents("whilemousedown").length).toBe(1);
      expect(eventHandler.getQueuedEvents("whilemousedown")[0].type).toBe("whilemousedown");
      expect(eventHandler.getQueuedEvents("whilemousedown")[0]).toEqual({
        ...mousedownPayload,
        type: "whilemousedown"
      });
    });

    it("can queue multiple events", () => {
      const eventHandler = new EventHandler(canvas);

      eventHandler.queueEvent("onmousedown", { type: "onmousedown", x: 0, y: 0, button: 0 });
      eventHandler.queueEvent("onmousedown", { type: "onmousedown", x: 0, y: 0, button: 1 });
      eventHandler.queueEvent("onmousedown", { type: "onmousedown", x: 0, y: 0, button: 2 });

      expect(eventHandler.getQueuedEvents("onmousedown").length).toBe(3);
      expect(eventHandler.getQueuedEvents("whilemousedown").length).toBe(3);
    });

    // why dequeue when we can just filter out queue after cycle?
    it("can deqeue a simple event", () => {
      const eventHandler = new EventHandler(canvas);

      eventHandler.queueEvent("ontick", { type: "ontick", deltaTime: 0 });

      expect(eventHandler.getQueuedEvents("ontick").length).toBe(1);

      // run this as a "cycle" passing
      eventHandler.dispatchQueue();

      expect(eventHandler.getQueuedEvents("ontick").length).toBe(0);
    });

    it("can dequeue an event with a persistent dependent without dequeueing that dependent", () => {
      const eventHandler = new EventHandler(canvas);

      eventHandler.queueEvent("onmousedown", { type: "onmousedown", x: 0, y: 0, button: 0 });

      expect(eventHandler.getQueuedEvents("onmousedown").length).toBe(1);
      expect(eventHandler.getQueuedEvents("whilemousedown").length).toBe(1);

      eventHandler.dispatchQueue();

      expect(eventHandler.getQueuedEvents("onmousedown").length).toBe(0);

      // Persistent events are not removed from queue until the queue contains a comparibly-equivalent negator event
      expect(eventHandler.getQueuedEvents("whilemousedown").length).toBe(1);
    });

    it("will dequeue the comparably-equivalent persistent event when a negator event is queued", () => {
      // in other words, onkeyup with key = "E" will dequeue whilekeydown with key = "E", but not whilekeydown with key = "Q"
      const eventHandler = new EventHandler(canvas);

      eventHandler.queueEvent("onkeydown", { type: "onkeydown", key: "E" });
      eventHandler.queueEvent("onkeydown", { type: "onkeydown", key: "Q" });

      expect(eventHandler.getQueuedEvents("onkeydown").length).toBe(2);
      expect(eventHandler.getQueuedEvents("whilekeydown").length).toBe(2);

      eventHandler.dispatchQueue();

      expect(eventHandler.getQueuedEvents("onkeydown").length).toBe(0);
      expect(eventHandler.getQueuedEvents("whilekeydown").length).toBe(2);

      eventHandler.queueEvent("onkeyup", { type: "onkeyup", key: "E" });

      expect(eventHandler.getQueuedEvents("onkeyup").length).toBe(1);
      expect(eventHandler.getQueuedEvents("whilekeydown").length).toBe(1);
    });

    it("will not queue an event if the engine is paused", () => {
      const eventHandler = new EventHandler(canvas);

      eventHandler.setEnginePauseStateCallback(() => true);

      eventHandler.queueEvent("onmousedown", { type: "onmousedown", x: 0, y: 0, button: 0 });

      expect(eventHandler.getQueuedEvents("onmousedown").length).toBe(0);
      expect(eventHandler.getQueuedEvents("whilemousedown").length).toBe(0);
    });
  });

  // no need to test event filtering since we've already done this in event queue tests
  describe("dispatcher", () => {
    it("calls registered callback", () => {
      const eventHandler = new EventHandler(canvas);

      const callbacks = {
        ontick: (payload: TickEventPayload) => {
          expectTypeOf(payload).toEqualTypeOf<TickEventPayload>();
        }
      };

      const ontickSpy = vi.spyOn(callbacks, "ontick");

      eventHandler.registerEventCallback("ontick", callbacks.ontick);

      eventHandler.queueEvent("ontick", { type: "ontick", deltaTime: 0 });

      eventHandler.dispatchQueue();

      expect(eventHandler.getQueuedEvents("ontick").length).toBe(0);
      expect(ontickSpy).toHaveBeenCalled();
    });

    it("calls multiple registered callbacks under a single event type", () => {
      const eventHandler = new EventHandler(canvas);

      const callbacks = {
        onmousedownA: (payload: MouseEventPayload) => {
          expectTypeOf(payload).toEqualTypeOf<MouseEventPayload>();
        },
        onmousedownB: (payload: MouseEventPayload) => {
          expectTypeOf(payload).toEqualTypeOf<MouseEventPayload>();
        }
      };

      const onmousedownASpy = vi.spyOn(callbacks, "onmousedownA");
      const onmousedownBSpy = vi.spyOn(callbacks, "onmousedownB");

      eventHandler.registerEventCallback("onmousedown", callbacks.onmousedownA);
      eventHandler.registerEventCallback("onmousedown", callbacks.onmousedownB);

      eventHandler.queueEvent("onmousedown", { type: "onmousedown", x: 0, y: 0, button: 0 });

      eventHandler.dispatchQueue();

      expect(eventHandler.getQueuedEvents("onmousedown").length).toBe(0);

      expect(onmousedownASpy).toHaveBeenCalled();
      expect(onmousedownBSpy).toHaveBeenCalled();
    });
  });
});
