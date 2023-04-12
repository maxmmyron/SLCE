interface EngineEventable {
  readonly type: string;
}

interface MouseEventPayload extends EngineEventable { button: number, x: number, y: number };
interface KeyEventPayload extends EngineEventable { key: string };
interface ResizeEventPayload extends EngineEventable { width: number, height: number };
interface TickEventPayload extends EngineEventable { deltaTime: number };
interface RenderEventPayload extends EngineEventable { interpolationFactor: number };

type EngineEventCallback<Type extends keyof EngineEventHandlersEventMap> = (payload: EngineEventHandlersEventMap[Type]) => any;

interface EngineEventHandlersEventMap {
  "onmousedown": MouseEventPayload;
  "whilemousedown": MouseEventPayload;
  "onmouseup": MouseEventPayload;
  "onmousemove": MouseEventPayload;
  "onkeydown": KeyEventPayload;
  "whilekeydown": KeyEventPayload;
  "onkeyup": KeyEventPayload;
  "onresize": ResizeEventPayload;
  "ontick": TickEventPayload;
  "onrender": RenderEventPayload;
};

interface EventHandlerable {
  registerEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: EngineEventCallback<Type>): void;
  unregisterEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: EngineEventCallback<Type>): void;

  queueEvent<Type extends keyof EngineEventHandlersEventMap>(type: Type, payload: EngineEventHandlersEventMap[Type]): void;
  dequeueEvent<Type extends keyof EngineEventHandlersEventMap>(type: Type): void;

  dispatchQueue(): void;

  attachEventListeners(canvas: HTMLCanvasElement): void;
  detachEventListeners(): void;
  setEnginePauseStateCallback(callback: () => boolean): void;

  getEventCallbacks<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventCallback<Type>[];
  getQueuedEvents<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventHandlersEventMap[Type][];
}

interface TextureLoader {
  load(path: string): Promise<ImageBitmap>;
}
