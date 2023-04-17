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

  private queuedEventPayloads: { [Type in keyof EngineEventHandlersEventMap]: EngineEventPayload<Type>[] } = {
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
      this.queueEvent("onkeydown", { type: "onkeydown", key: event.key }, {repeat: event.repeat});
    }],
    ["keyup", (event: any) => {
      event = event as KeyboardEvent
      this.queueEvent("onkeyup", { type: "onkeyup", key: event.key }, { repeat: event.repeat });
    }],
    ["resize", null]
  ]);

  /**
   * A callback that reports the current state of the engine's pause state. Used to dynamically link the engine's pause state to the event handler.
   *
   * @returns The current state of the engine's pause state. If true, no events will be queued.
   */
  private getEnginePauseState: () => boolean = () => false;

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
      this.queuedEventPayloads[type as keyof EngineEventHandlersEventMap] = [];
    }

    this.resizeObserver.disconnect();
  }

  registerEventCallback = <Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void => {
    this.callbackRegistry[type].push(callback);
  };

  unregisterEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void {
    this.callbackRegistry[type].splice(this.callbackRegistry[type].indexOf(callback), 1);
  }

  queueEvent<Type extends keyof EngineEventHandlersEventMap>(type: Type, payload: EngineEventPayload<Type>, options?: Partial<EngineEventOptions>): void {
    if (this.getEnginePauseState()) return;

    // TODO: this function is nasty. should be possible to refactor this into something that doesn't require a switch statement

    switch (type) {
      case "onmousedown":
        this.queuedEventPayloads[type].push(payload);
        this.queuedEventPayloads["whilemousedown"].push(<MouseEventPayload>{
          ...payload,
          type: "whilemousedown"
        });
        break;
      case "onmouseup":
        this.queuedEventPayloads[type].push(payload);
        this.queuedEventPayloads["whilemousedown"] = this.queuedEventPayloads["whilemousedown"].filter((event: EngineEventPayload<"whilemousedown">) => event.button !== (<MouseEventPayload>payload).button);
        break;
      case "onkeydown":
        if(options?.repeat) return;
        this.queuedEventPayloads[type].push(payload);
        this.queuedEventPayloads["whilekeydown"].push(<KeyEventPayload>{
          ...payload,
          type: "whilekeydown"
        });
        break;
      case "onkeyup":
        if (options?.repeat) return;
        this.queuedEventPayloads[type].push(payload);
        this.queuedEventPayloads["whilekeydown"] = this.queuedEventPayloads["whilekeydown"].filter((event: EngineEventPayload<"whilekeydown">) => event.key !== (<KeyEventPayload>payload).key);
        break;
      default:
        this.queuedEventPayloads[type].push(payload);
        break;
    }
  }

  dispatchQueue(): void {
    for(const type in this.queuedEventPayloads) {
      const registeredCallbacks = this.callbackRegistry[type as keyof EngineEventHandlersEventMap] as EngineEventCallback<keyof EngineEventHandlersEventMap>[];
      const queuedPayloads = this.queuedEventPayloads[type as keyof EngineEventHandlersEventMap] as EngineEventPayload<keyof EngineEventHandlersEventMap>[];

      registeredCallbacks.forEach((callback) => queuedPayloads.forEach((payload) => callback(payload)));

      if(type !== "whilemousedown" && type !== "whilekeydown") {
        this.queuedEventPayloads[type as keyof EngineEventHandlersEventMap] = [];
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
    this.getEnginePauseState = callback;
  }

  getRegisteredCallbacks<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventCallback<Type>[] {
    return this.callbackRegistry[type];
  }

  getQueuedPayloads<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventPayload<Type>[] {
    return this.queuedEventPayloads[type];
  }
}
