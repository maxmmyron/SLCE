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

    let resizeObserver: ResizeObserver;

    let canvasElement: HTMLCanvasElement;

    const addToQueue = (type: ValidEventType, payload: ValidEventPayload, isPersistent: boolean = false, persistUntil: string = ""): void => {
      // because stuff like addEventListener is called regardless of engine
      // state, we want to filter out any events queued while the engine is
      // paused.
      if (isEnginePaused) return;

      if (queue.findIndex(queuedEvent => queuedEvent.type === type) !== -1) return

      queue.push({ type, payload, isPersistent, persistUntil });
    };

    const onMouseDown = (e: any): void => {
      addToQueue("onmousedown", { x: e.x, y: e.y });
    };

    const onMouseUp = (e: any): void => {
      addToQueue("onmouseup", { x: e.x, y: e.y });
    };

    const onMouseMove = (e: any): void => {
      addToQueue("onmousemove", { x: e.x, y: e.y });
    };

    const onKeyDown = (e: any): void => {
      addToQueue("onkeydown", { key: e.key, code: e.code });
    };

    const onKeyUp = (e: any): void => {
      addToQueue("onkeyup", { key: e.key, code: e.code });
    };

    const onCanvasResize = (e: any): void => {
      addToQueue("oncanvasresize", { width: e.contentRect.width, height: e.contentRect.height });
    };

    const eventHandlerMap: Map<string, (e: any) => void> = new Map([
      ["mousedown", onMouseDown],
      ["mouseup", onMouseUp],
      ["mousemove", onMouseMove],
      ["keydown", onKeyDown],
      ["keyup", onKeyUp],
      ["resize", onCanvasResize],
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

      queueEvent: (name: ValidEventType, event: any, isPersistent: boolean = false, persistUntil: string = ""): void => {
        addToQueue(name, event, isPersistent, persistUntil);
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
      },

      attachEventListeners: (canvas: HTMLCanvasElement): void => {
        canvasElement = canvas;

        eventHandlerMap.forEach((callback, eventName) => {
          switch (eventName) {
            case "resize":
              resizeObserver = new ResizeObserver(callback);
              resizeObserver.observe(canvas);
              break;
            default:
              canvas.addEventListener(eventName, callback);
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
              canvasElement.removeEventListener(eventName, callback);
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
