export default class EventHandler implements EventHandlerable {
  /**
   * A map of event names to their respective arrays of registered callbacks.
   */
  private callbackRegistry: { [Type in keyof EngineEventHandlersEventMap]: EngineEventCallback<Type>[] } = {
    "onmousedown": [],
    "whilemousedown": [],
    "onmouseup": [],
    "onmousemove": [],
    "onkeydown": [],
    "whilekeydown": [],
    "onkeyup": [],
    "onresize": [],
    "ontick": [],
    "onrender": []
  };

  private queuedEvents: { [Type in keyof EngineEventHandlersEventMap]: EngineEventHandlersEventMap[Type][] } = {
    "onmousedown": [],
    "whilemousedown": [],
    "onmouseup": [],
    "onmousemove": [],
    "onkeydown": [],
    "whilekeydown": [],
    "onkeyup": [],
    "onresize": [],
    "ontick": [],
    "onrender": []
  };


  registerEventCallback = <Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void => {
    this.callbackRegistry[type].push(callback);
  };

  unregisterEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void {
    this.callbackRegistry[type].splice(this.callbackRegistry[type].indexOf(callback), 1);
  }

  queueEvent<Type extends keyof EngineEventHandlersEventMap>(type: Type, payload: EngineEventHandlersEventMap[Type]): void {
    this.queuedEvents[type].push(payload);
  }

  dequeueEvent<Type extends keyof EngineEventHandlersEventMap>(type: Type): void {
    this.queuedEvents[type].shift();
  }

  dispatchQueue(): void {
    for(let i = 0; i < Object.keys(this.queuedEvents).length; i++) {
      const type = Object.keys(this.queuedEvents)[i] as keyof EngineEventHandlersEventMap;

      const callbacks = this.callbackRegistry[type] as EngineEventCallback<keyof EngineEventHandlersEventMap>[];
      const queuedEvents = this.queuedEvents[type] as EngineEventHandlersEventMap[keyof EngineEventHandlersEventMap][];

      callbacks.forEach(callback => queuedEvents.forEach(queuedEvent => callback(queuedEvent)));
    }

    this.filterQueuedEvents();
  }

  attachEventListeners(canvas: HTMLCanvasElement): void {}

  detachEventListeners(): void {}

  setEnginePauseStateCallback(callback: () => boolean): void {}

  getEventCallbacks<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventCallback<Type>[] {
    return this.callbackRegistry[type];
  }

  getQueuedEvents<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventHandlersEventMap[Type][] {
    return this.queuedEvents[type];
  }

  private filterQueuedEvents(): void {}
}
