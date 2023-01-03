export const EventHandler = (() => {
  let instance: EventHandler;

  const EventHandler = (): EventHandler => {
    /**
     * A collection of event names with their associated callbacks.
     */
    let events: Array<{ name: ValidEventType, callbacks: Array<((event: ValidEventPayload) => void)> }> = [];

    /**
     * An array of QueuedEvents. Serves as a "repository" of sorts for events
     * that can be called at any point during the update cycle. Events added
     * to the queue will be called during the next tick cycle.
     */
    let queue: Array<QueuedEvent> = [];

    /**
     * A boolean describing the current pause state of the engine.
     */
    let isEnginePaused: boolean = true;

    let resizeObserver: ResizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]): void => {
      entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        addToQueue("onresize", { width, height });
      });
    });

    let canvasElement: HTMLCanvasElement;

    const addToQueue = (type: ValidEventType, payload: ValidEventPayload, isPersistent: boolean = false, persistUntil: string = "", isStrict: boolean = false): void => {
      // because stuff like addEventListener is called regardless of engine
      // state, we want to filter out any events queued while the engine is
      // paused.
      //queue.findIndex(queuedEvent => queuedEvent.type === type) !== -1
      if (isEnginePaused) return;

      queue.push({ type, payload, isPersistent, persistUntil, isStrict });
    };

    const filterQueue = (): void => {
      // filter persistent events
      queue = queue.filter(queuedEvent => {
        // if event has no persistUntil value, don't filter
        if (queuedEvent.persistUntil === "") return true;

        // filter out persistent events by type and payload (if strict).
        // if found, return false to filter out
        return queue.findIndex(e => {
          if (e.type !== queuedEvent.persistUntil) return false;

          if (!queuedEvent.isStrict) return true;

          // JSON.stringify is a dirty way to compare two objects because it
          // doesn't account for the possibility of object keys being in
          // different orders. TODO: use a more robust method to compare two
          // objects.

          return JSON.stringify(e.payload) === JSON.stringify(queuedEvent.payload);
        }) === -1;
      });

      // remove non-persistent events
      queue = queue.filter(queuedEvent => queuedEvent.isPersistent);
    };

    const queueMouseDownEvents = (e: any): void => {
      addToQueue("onmousedown", { x: e.x, y: e.y });
      addToQueue("whilemousedown", { x: e.x, y: e.y }, true, "onmouseup");
    };

    const queueMouseUpEvents = (e: any): void => {
      addToQueue("onmouseup", { x: e.x, y: e.y });
    };

    const queueMouseMoveEvents = (e: any): void => {
      addToQueue("onmousemove", { x: e.x, y: e.y });
    }

    const queueKeyDownEvents = (e: any): void => {
      addToQueue("onkeydown", { key: e.key });
      addToQueue("whilekeydown", { key: e.key }, true, "onkeyup", true);
    };

    const queueKeyUpEvents = (e: any): void => {
      addToQueue("onkeyup", { key: e.key });
    };

    const eventHandlerMap: Map<string, ((e: any) => void) | null> = new Map([
      ["mousedown", queueMouseDownEvents],
      ["mouseup", queueMouseUpEvents],
      ["mousemove", queueMouseMoveEvents],
      ["keydown", queueKeyDownEvents],
      ["keyup", queueKeyUpEvents],
      // handled with ResizeObserver so we don't need a handler function
      ["resize", null],
    ]);

    /**
     * Returns the index of the event name in the events array.
     *
     * @param name the name of the event to search for.
     * @returns an index of the event in the events array, or -1 if the event
     * does not exist.
     */
    const getEventIndex = (name: string): number => events.findIndex(e => e.name === name);

    return {
      addListener: (name: ValidEventType, callback: ((event: any) => void)): void => {
        const eventIndex = getEventIndex(name);

        if (eventIndex === -1) events.push({ name, callbacks: [callback] })
        else {
          const callbacks = events[eventIndex].callbacks;
          callbacks.push(callback);
        }
      },

      removeListener: (name: ValidEventType, callback: ((ev: ValidEventPayload) => void)): void => {
        const eventIndex = getEventIndex(name);
        if (eventIndex === -1) return;

        const callbacks = events[eventIndex].callbacks;
        callbacks.splice(callbacks.indexOf(callback), 1);
      },

      queueEvent: (name: ValidEventType, event: any, isPersistent: boolean = false, persistUntil: string = "", isStrict: boolean = false): void => {
        addToQueue(name, event, isPersistent, persistUntil, isStrict);
      },

      dequeueEvent: (name: ValidEventType): void => {
        queue = queue.filter(queuedEvent => queuedEvent.type !== name);
      },

      dispatchQueue: (): void => {
        queue.forEach(queuedEvent => {
          const eventIndex = getEventIndex(queuedEvent.type);
          if (eventIndex === -1) return;

          const callbacks = events[eventIndex].callbacks;
          callbacks.forEach(callback => callback(queuedEvent.payload));
        });

        filterQueue();
      },

      attachEventListeners: (canvas: HTMLCanvasElement): void => {
        canvasElement = canvas;

        eventHandlerMap.forEach((callback, eventName) => {
          switch (eventName) {
            case "resize":
              resizeObserver.observe(canvas);
              break;
            default:
              canvas.addEventListener(eventName, callback as (e: any) => void);
              break;
          }
        });
      },

      detachEventListeners: (): void => {
        eventHandlerMap.forEach((callback, eventName) => {
          switch (eventName) {
            case "resize":
              resizeObserver.unobserve(canvasElement);
              break;
            default:
              canvasElement.removeEventListener(eventName, callback as (e: any) => void);
              break;
          }
        });
      },

      // ****************************************************************
      // ⚓ GETTERS AND SETTERS
      // ****************************************************************

      getQueuedEvents: (): Array<QueuedEvent> => queue,

      setIsEnginePaused: (isPaused: boolean): void => {
        isEnginePaused = isPaused;
      },
    };
  };

  return {
    /**
     * Gets the singleton instance of the EventHandler.
     *
     * @returns the singleton instance of the EventHandler. If the instance
     * does not exist, it will be created.
     */
    getInstance: (): EventHandler => instance || (instance = EventHandler())
  };
})();
