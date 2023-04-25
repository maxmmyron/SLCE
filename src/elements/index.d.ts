interface Elementable {
  readonly name: string;
  readonly engine: Engineable;

  isQueuedForDisposal: boolean;
  isRenderEnabled: boolean;
  isTickEnabled: boolean;
  isDebugEnabled: boolean;

  position: Vectorable;
  velocity: Vectorable;
  rotation: number;
  scale: Vectorable;

  registerEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void;
  unregisterEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void;

  start(): Promise<any>;
  preload(): Promise<any>;
  tick(frameTimestep: number): void;
  render(interpolationFactor: number): void;
  setPosition(position: Vectorable): void;

  get ID(): string;
}

interface Sceneable extends Elementable {
  camera: Camerable;
  actors: Map<string, Actorable>;
  environment: SceneEnvironment;
}

interface Actorable extends Elementable {
  readonly scene: Sceneable;

  textureID: string;

  isGravityEnabled: boolean;
  isCollisionEnabled: boolean;
  isTextureEnabled: boolean;
}

type Texture = {
  bitmap: ImageBitmap;
  size: Vectorable;
  frameSize: Vectorable;
  frameDuration: number;
  frameCount: Vectorable;
};

type ElementOptions = Partial<{
  position: Vectorable;
  velocity: Vectorable;
  rotation: number;
  scale: Vectorable;
  isDebugEnabled: boolean;
}>;

type ActorOptions = Partial<{
  isGravityEnabled: boolean;
  isCollisionEnabled: boolean;
  isTextureEnabled: boolean;
} & ElementOptions>;

type SceneOptions = Partial<ElementOptions & SceneEnvironment>

type SceneEnvironment = {
  background: string;
  gravity: Vectorable;
}
