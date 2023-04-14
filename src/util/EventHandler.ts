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

  private queuedEvents: { [Type in keyof EngineEventHandlersEventMap]: EngineEventHandlersEventMap[Type] | null } = {
    "onmousedown": null,
    "whilemousedown": null,
    "onmouseup": null,
    "onmousemove": null,
    "onkeydown": null,
    "whilekeydown": null,
    "onkeyup": null,
    "onresize": null,
    "ontick": null,
    "onrender": null
  };

  registerEventCallback = <Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void => {
    this.callbackRegistry[type].push(callback);
  };

  unregisterEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void {
    this.callbackRegistry[type].splice(this.callbackRegistry[type].indexOf(callback), 1);
  }

  queueEvent<Type extends keyof EngineEventHandlersEventMap>(type: Type, payload: EngineEventHandlersEventMap[Type]): void {
    switch (type) {
      case "onmousedown":
        this.queuedEvents["whilemousedown"] = {
          ...payload,
          type: "whilemousedown"
        } as EngineEventHandlersEventMap["whilemousedown"];
        break;
      case "onmouseup":
        this.queuedEvents["whilemousedown"] = null;
        break;
      case "onkeydown":
        this.queuedEvents["whilekeydown"] = {
          ...payload,
          type: "whilekeydown"
        } as EngineEventHandlersEventMap["whilekeydown"];
        break;
      case "onkeyup":
        this.queuedEvents["whilekeydown"] = null;
        break;
    }

    this.queuedEvents[type] = payload;
  }

  dequeueEvent<Type extends keyof EngineEventHandlersEventMap>(type: Type): void {
    this.queuedEvents[type] = null;
  }

  dispatchQueue(): void {
    for(let i = 0; i < Object.keys(this.queuedEvents).length; i++) {
      const type = Object.keys(this.queuedEvents)[i] as keyof EngineEventHandlersEventMap;

      const callbacks = this.callbackRegistry[type] as EngineEventCallback<keyof EngineEventHandlersEventMap>[];
      const queuedEvents = this.queuedEvents[type] as EngineEventHandlersEventMap[keyof EngineEventHandlersEventMap];

      callbacks.forEach(callback => callback(queuedEvents));

      if(type !== "whilemousedown" && type !== "whilekeydown") {
        this.dequeueEvent(type);
      }
    }
  }

  attachEventListeners(canvas: HTMLCanvasElement): void {}

  detachEventListeners(): void {}

  setEnginePauseStateCallback(callback: () => boolean): void {}

  getEventCallbacks<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventCallback<Type>[] {
    return this.callbackRegistry[type];
  }

  getQueuedEvents<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventHandlersEventMap[Type] | null {
    return this.queuedEvents[type];
  }
}
