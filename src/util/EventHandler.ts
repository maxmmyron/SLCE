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

  // TODO: reimplement as arrays
  private queuedEvents: { [Type in keyof EngineEventHandlersEventMap]: EngineEventPayload<Type>[] } = {
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

  private resizeObserver: ResizeObserver;

  private canvas: HTMLCanvasElement;

  private canvasEventHandlerMap: Map<string, ((event: any) => any) | null> = new Map([
    ["mousedown", (event: any) => {
      event = event as MouseEvent;
      this.queueEvent("onmousedown", { type: "onmousedown", button: event.button, x: event.offsetX, y: event.offsetY });
    }],
    ["mouseup", (event: any) => {
      event = event as MouseEvent;
      this.queueEvent("onmouseup", { type: "onmouseup", button: event.button, x: event.offsetX, y: event.offsetY });
    }],
    ["mousemove", (event: any) => {
      event = event as MouseEvent;
      this.queueEvent("onmousemove", { type: "onmousemove", button: event.button, x: event.offsetX, y: event.offsetY });
    }],
    ["keydown", (event: any) => {
      event = event as KeyboardEvent
      this.queueEvent("onkeydown", { type: "onkeydown", key: event.key });
    }],
    ["keyup", (event: any) => {
      event = event as KeyboardEvent
      this.queueEvent("onkeyup", { type: "onkeyup", key: event.key });
    }],
    ["resize", null]
  ]);

  private enginePauseStateCallback: () => boolean = () => false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      this.queueEvent("onresize", { type: "onresize", width: entry.contentRect.width, height: entry.contentRect.height });
    });

    this.attachEventListeners();
  }

  destroy(): void {
    this.detachEventListeners();

    for (const type of Object.keys(this.callbackRegistry)) {
      this.callbackRegistry[type as keyof EngineEventHandlersEventMap] = [];
      this.queuedEvents[type as keyof EngineEventHandlersEventMap] = null;
    }

    this.resizeObserver.disconnect();
  }

  registerEventCallback = <Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void => {
    this.callbackRegistry[type].push(callback);
  };

  unregisterEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void {
    this.callbackRegistry[type].splice(this.callbackRegistry[type].indexOf(callback), 1);
  }

  queueEvent<Type extends keyof EngineEventHandlersEventMap>(type: Type, payload: EngineEventHandlersEventMap[Type]): void {
    if(!this.enginePauseStateCallback()) return;

    console.log(type, payload);

    switch (type) {
      case "onmousedown":
        this.queuedEvents["onmousedown"] = payload as EngineEventHandlersEventMap["onmousedown"];
        this.queuedEvents["whilemousedown"] = {
          ...payload,
          type: "whilemousedown"
        } as EngineEventHandlersEventMap["whilemousedown"];
        break;
      case "onmouseup":
        this.queuedEvents["onmouseup"] = payload as EngineEventHandlersEventMap["onmouseup"];
        this.queuedEvents["whilemousedown"] = null;
        break;
      case "onkeydown":
        this.queuedEvents["onkeydown"] = payload as EngineEventHandlersEventMap["onkeydown"];
        this.queuedEvents["whilekeydown"] = {
          ...payload,
          type: "whilekeydown"
        } as EngineEventHandlersEventMap["whilekeydown"];
        break;
      case "onkeyup":
        this.queuedEvents["onkeyup"] = payload as EngineEventHandlersEventMap["onkeyup"];
        this.queuedEvents["whilekeydown"] = null;
        break;
      default:
        this.queuedEvents[type] = payload;
        break;
    }
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

  attachEventListeners(): void {
    this.canvasEventHandlerMap.forEach((handler, type) => {
      switch(type) {
        case "resize":
          this.resizeObserver.observe(this.canvas);
          break;
        default:
          this.canvas.addEventListener(type as keyof HTMLElementEventMap, handler as (event: any) => any);
          break;
      }
    });
  }

  detachEventListeners(): void {
    this.canvasEventHandlerMap.forEach((handler, type) => {
      switch(type) {
        case "resize":
          this.resizeObserver.unobserve(this.canvas);
          this.resizeObserver.disconnect();
          break;
        default:
          this.canvas.removeEventListener(type as keyof HTMLElementEventMap, handler as (event: any) => any);
          break;
      }
    });
  }

  setEnginePauseStateCallback(callback: () => boolean): void {
    this.enginePauseStateCallback = callback;
  }

  getEventCallbacks<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventCallback<Type>[] {
    return this.callbackRegistry[type];
  }

  getQueuedEvents<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventPayload<Type>[] {
    return this.queuedEvents[type];
  }
}
