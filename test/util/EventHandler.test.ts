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

      expect(eventHandler.getQueuedEvents("onrender")).not.toBeNull();
      expect(eventHandler.getQueuedEvents("onrender")?.type).toBe("onrender");
      expect(eventHandler.getQueuedEvents("onrender")).toEqual({
        type: "onrender",
        interpolationFactor: 0,
      });
    });

    it("will queue related persistent events", () => {
      const eventHandler = new EventHandler();

      const mousedownPayload = { type: "onmousedown", x: 0, y: 0, button: 0 }
      eventHandler.queueEvent("onmousedown", mousedownPayload);

      expect(eventHandler.getQueuedEvents("onmousedown")).not.toBeNull();
      expect(eventHandler.getQueuedEvents("onmousedown")?.type).toBe("onmousedown");
      expect(eventHandler.getQueuedEvents("onmousedown")).toEqual(mousedownPayload);

      expect(eventHandler.getQueuedEvents("whilemousedown")).not.toBeNull();
      expect(eventHandler.getQueuedEvents("whilemousedown")?.type).toBe("whilemousedown");
      expect(eventHandler.getQueuedEvents("whilemousedown")).toEqual({
        ...mousedownPayload,
        type: "whilemousedown"
      });
    });

    it("can be dequeued", () => {
      const eventHandler = new EventHandler();

      eventHandler.queueEvent("onmousedown", { type: "onmousedown", x: 0, y: 0, button: 0 });

      expect(eventHandler.getQueuedEvents("onmousedown")).not.toBeNull();
      expect(eventHandler.getQueuedEvents("whilemousedown")).not.toBeNull();

      eventHandler.dequeueEvent("onmousedown");

      expect(eventHandler.getQueuedEvents("onmousedown")).toBeNull();

      // Persistent events are not removed from queue until the queue contains a comparibly-equivalent negator event
      expect(eventHandler.getQueuedEvents("whilemousedown")).not.toBeNull();
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

      expect(eventHandler.getQueuedEvents("ontick")).toBeNull();
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

      expect(eventHandler.getQueuedEvents("onmousedown")).toBeNull();
      expect(eventHandler.getQueuedEvents("whilemousedown")).not.toBeNull();

      expect(mousedownSpy).toHaveBeenCalled();
      expect(whilemousedownSpy).toHaveBeenCalled();
    });

    it("removes persistent event from queue if comparison event is dispatched");
  });
});
