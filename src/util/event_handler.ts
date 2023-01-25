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
    let enginePauseStateCallback: (() => boolean) = () => true;

    let resizeObserver: ResizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]): void => {
      entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        addToQueue("onresize", { width, height });
      });
    });

    let canvasElement: HTMLCanvasElement;

    const addToQueue = (type: ValidEventType, payload: ValidEventPayload, isPersistent: boolean = false, comparisonType: string = ""): void => {
      if (enginePauseStateCallback()) return;

      queue.push({ type, payload, isPersistent, comparisonType });
    };

    const filterQueue = (): void => {
      queue = queue.filter(queuedEvent => {
        if (queuedEvent.comparisonType === "") return true;

        return queue.findIndex(e => {
          if (e.type !== queuedEvent.comparisonType) return false;

          switch (queuedEvent.type) {
            case "whilekeydown":
              return comparePayloads<KeyEventPayload>(<KeyEventPayload>e.payload, <KeyEventPayload>queuedEvent.payload);
            case "whilemousedown":
              return comparePayloads<MouseEventPayload>(<MouseEventPayload>e.payload, <MouseEventPayload>queuedEvent.payload);
          }
        }) === -1;
      });

      queue = queue.filter(queuedEvent => queuedEvent.isPersistent);
    };

    const comparePayloads = <T extends ValidEventPayload>(a: T, b: T): boolean => {
      for (const key in a) {
        if (a[key] !== b[key]) return false;
      }

      return true;
    };


    const queueMouseDownEvents = (e: any): void => {
      addToQueue("onmousedown", <MouseEventPayload>{ button: e.button, x: e.x, y: e.y });
      addToQueue("whilemousedown", <MouseEventPayload>{ button: e.button, x: e.x, y: e.y }, true, "onmouseup");
    };

    const queueMouseUpEvents = (e: any): void => {
      addToQueue("onmouseup", <MouseEventPayload>{ button: e.button, x: e.x, y: e.y });
    };

    const queueMouseMoveEvents = (e: any): void => {
      addToQueue("onmousemove", <MouseEventPayload>{ button: e.button, x: e.x, y: e.y });
    }


    const queueKeyDownEvents = (e: any): void => {
      if (e.repeat) return;

      addToQueue("onkeydown", <KeyEventPayload>{ key: e.key });
      addToQueue("whilekeydown", <KeyEventPayload>{ key: e.key }, true, "onkeyup");
    };

    const queueKeyUpEvents = (e: any): void => {
      addToQueue("onkeyup", <KeyEventPayload>{ key: e.key });
    }

    const eventHandlerMap: Map<string, ((e: any) => void) | null> = new Map([
      ["mousedown", queueMouseDownEvents],
      ["mouseup", queueMouseUpEvents],
      ["mousemove", queueMouseMoveEvents],
      ["keydown", queueKeyDownEvents],
      ["keyup", queueKeyUpEvents],
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
      addListener: (name: ValidEventType, callback: ((event: ValidEventPayload) => void)): void => {
        const eventIndex = getEventIndex(name);

        if (eventIndex === -1) events.push({ name, callbacks: [callback] })
        else {
          const callbacks = events[eventIndex].callbacks;
          callbacks.push(callback);
        }
      },

      removeListener: (name: ValidEventType, callback: ((event: ValidEventPayload) => void)): void => {
        const eventIndex = getEventIndex(name);
        if (eventIndex === -1) return;

        const callbacks = events[eventIndex].callbacks;
        callbacks.splice(callbacks.indexOf(callback), 1);
      },

      queueEvent: (name: ValidEventType, event: any, isPersistent: boolean = false, comparisonType: string = ""): void => {
        addToQueue(name, event, isPersistent, comparisonType);
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
              canvas.addEventListener(eventName, <(e: any) => void>callback);
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
              canvasElement.removeEventListener(eventName, <(e: any) => void>callback);
              break;
          }
        });
      },

      getQueuedEvents: (): Array<QueuedEvent> => queue,

      setEnginePauseStateCallback: (callback: (() => boolean)): void => {
        enginePauseStateCallback = callback;
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
