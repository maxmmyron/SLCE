import { describe, it, expect, expectTypeOf, vi } from "vitest";
import EventHandler from "@/util/EventHandler";

describe("EventHandler", () => {
  it("is instantiable", () => {
    const eventHandler = new EventHandler();

    expect(eventHandler).toBeInstanceOf(EventHandler);
    expectTypeOf(eventHandler).toEqualTypeOf<EventHandler>();
  });

  describe("event callbacks", () => {
    it("can be registered to the callback registry", () => {
      const eventHandler = new EventHandler();

      eventHandler.registerEventCallback("onmousedown", () => {});

      expect(eventHandler.getEventCallbacks("onmousedown").length).toBe(1);
    });

    it("can be unregistered from the callback registry", () => {
      const eventHandler = new EventHandler();

      let callback: EngineEventCallback<"onmousedown"> = () => {};

      eventHandler.registerEventCallback("onmousedown", callback);
      expect(eventHandler.getEventCallbacks("onmousedown").length).toBe(1);

      eventHandler.unregisterEventCallback("onmousedown", callback);
      expect(eventHandler.getEventCallbacks("onmousedown").length).toBe(0);
    });
  });

  describe("event payloads", () => {
    it("can be queued", () => {
      const eventHandler = new EventHandler();

      eventHandler.queueEvent("onrender", {type: "onrender", interpolationFactor: 0});

      expect(eventHandler.getQueuedEvents("onrender").length).toBe(1);
      expect(eventHandler.getQueuedEvents("onrender")[0].type).toBe("onrender");
      expect(eventHandler.getQueuedEvents("onrender")[0]).toEqual({
        type: "onrender",
        interpolationFactor: 0,
      });
    });

    it("will queue related persistent events", () => {
      const eventHandler = new EventHandler();

      const mousedownPayload = { type: "onmousedown", x: 0, y: 0, button: 0 }
      eventHandler.queueEvent("onmousedown", mousedownPayload);

      expect(eventHandler.getQueuedEvents("onmousedown").length).toBe(1);
      expect(eventHandler.getQueuedEvents("onmousedown")[0].type).toBe("onmousedown");
      expect(eventHandler.getQueuedEvents("onmousedown")[0]).toEqual(mousedownPayload);

      expect(eventHandler.getQueuedEvents("whilemousedown").length).toBe(1);
      expect(eventHandler.getQueuedEvents("whilemousedown")[0].type).toBe("whilemousedown");
      expect(eventHandler.getQueuedEvents("whilemousedown")[0]).toEqual(mousedownPayload);
    });

    it("can be dequeued", () => {
      const eventHandler = new EventHandler();

      eventHandler.queueEvent("onmousedown", { type: "onmousedown", x: 0, y: 0, button: 0 });

      expect(eventHandler.getQueuedEvents("onmousedown").length).toBe(1);
      expect(eventHandler.getQueuedEvents("whilemousedown").length).toBe(1);

      eventHandler.dequeueEvent("onmousedown");

      expect(eventHandler.getQueuedEvents("onmousedown").length).toBe(0);

      // Persistent events are not removed from queue until the queue contains a comparibly-equivalent negator event
      expect(eventHandler.getQueuedEvents("whilemousedown").length).toBe(1);
    });
  });

  describe("dispatching events", () => {
    it("dispatches queued events", () => {
      const eventHandler = new EventHandler();

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

    it("does not remove independently persistent event from queue", () => {
      const eventHandler = new EventHandler();

      const callbacks = {
        onmousedown: (payload: MouseEventPayload) => {
          expectTypeOf(payload).toEqualTypeOf<MouseEventPayload>();
        },
        whilemousedown: (payload: MouseEventPayload) => {
          expectTypeOf(payload).toEqualTypeOf<MouseEventPayload>();
        }
      };

      const mousedownSpy = vi.spyOn(callbacks, "onmousedown");
      const whilemousedownSpy = vi.spyOn(callbacks, "whilemousedown");

      eventHandler.registerEventCallback("onmousedown", callbacks.onmousedown);
      eventHandler.registerEventCallback("whilemousedown", callbacks.whilemousedown);

      eventHandler.queueEvent("onmousedown", { type: "onmousedown", x: 0, y: 0, button: 0 });

      eventHandler.dispatchQueue();

      expect(eventHandler.getQueuedEvents("onmousedown").length).toBe(0);
      expect(eventHandler.getQueuedEvents("whilemousedown").length).toBe(1);

      expect(mousedownSpy).toHaveBeenCalled();
      expect(whilemousedownSpy).toHaveBeenCalled();
    });

    it("removes persistent event from queue if comparison event is dispatched");
  });
});
