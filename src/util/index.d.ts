interface EngineEventable {
  readonly type: string;
}

interface MouseEventPayload extends EngineEventable { button: number, x: number, y: number };
interface KeyEventPayload extends EngineEventable { key: string };
interface ResizeEventPayload extends EngineEventable { width: number, height: number };
interface TickEventPayload extends EngineEventable { deltaTime: number };
interface RenderEventPayload extends EngineEventable { interpolationFactor: number };

type EngineEventCallback<Type extends keyof EngineEventHandlersEventMap> = (payload: EngineEventHandlersEventMap[Type]) => any;
type EngineEventPayload<Type extends keyof EngineEventHandlersEventMap> = EngineEventHandlersEventMap[Type];

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

interface EngineEventOptions {
  repeat: boolean;
}

interface EventHandlerable {
  registerEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: EngineEventCallback<Type>): void;
  unregisterEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: EngineEventCallback<Type>): void;

  queueEvent<Type extends keyof EngineEventHandlersEventMap>(type: Type, payload: EngineEventPayload<Type>, options: Partial<EngineEventOptions<Type>>): void;

  dispatchQueue(): void;

  attachEventListeners(): void;
  detachEventListeners(): void;
  setEnginePauseStateCallback(callback: () => boolean): void;

  getRegisteredCallbacks<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventCallback<Type>[];
  getQueuedPayloads<Type extends keyof EngineEventHandlersEventMap>(type: Type): EngineEventPayload<Type>[];
}

interface TextureLoader {
  load(path: string): Promise<ImageBitmap>;
}
