export const EventHandler = (() => {
  let instance: EventHandler;

  const EventHandler = (): EventHandler => {
    /**
     * A collection of event names with their associated callbacks.
     */
    let events: Array<{ name: ValidEventName, callbacks: Array<((event: any) => void)> }> = [];

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

    /**
     * Returns the index of the event name in the events array.
     *
     * @param name the name of the event to search for.
     * @returns an index of the event in the events array, or -1 if the event
     * does not exist.
     */
    const getEventIndex = (name: string): number => events.findIndex(e => e.name === name);

    return {
      addListener: (name: ValidEventName, callback: ((event: any) => void)): void => {
        const eventIndex = getEventIndex(name);

        if (eventIndex === -1) events.push({ name, callbacks: [callback] })
        else {
          const callbacks = events[eventIndex].callbacks;
          callbacks.push(callback);
        }
      },

      addToQueue: (name: ValidEventName, event: any, isPersistent: boolean = false, persistUntil: string = ""): void => {
        // because stuff like addEventListener is called regardless of engine
        // state, we want to filter out any events queued while the engine is
        // paused.
        if (isEnginePaused) return;

        if (queue.findIndex(queuedEvent => queuedEvent.name === name) !== -1) return

        queue.push({ name, event, isPersistent, persistUntil });
      },

      removeFromQueue: (name: ValidEventName): void => {
        queue = queue.filter(queuedEvent => queuedEvent.name !== name);
      },

      dispatchQueue: (): void => {
        queue.forEach(queuedEvent => {
          const eventIndex = getEventIndex(queuedEvent.name);
          if (eventIndex === -1) return;

          const callbacks = events[eventIndex].callbacks;
          callbacks.forEach(callback => callback(queuedEvent.event));
        });
      },

      removeListener: (name: ValidEventName, callback: ((ev: Event) => void)): void => {
        const eventIndex = getEventIndex(name);
        if (eventIndex === -1) return;

        const callbacks = events[eventIndex].callbacks;
        callbacks.splice(callbacks.indexOf(callback), 1);
      },

      getQueuedEvents: (): Array<QueuedEvent> => queue,

      setIsEnginePaused: (isPaused: boolean): void => {
        isEnginePaused = isPaused;
      }
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
