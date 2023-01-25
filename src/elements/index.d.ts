interface Elementable {
  readonly name: string;
  readonly engine: Engineable;

  isQueuedForDisposal: boolean;
  isRenderEnabled: boolean;
  isTickEnabled: boolean;
  isDebugEnabled: boolean;

  position: Vectorable;
  velocity: Vectorable;
  rotation: Vectorable;
  size: Vectorable;

  addListener(event: ValidEventType, callback: ((event: ValidEventPayload) => void)): void;
  removeListener(event: ValidEventType, callback: ((event: ValidEventPayload) => void)): void;

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

  isGravityEnabled: boolean;
  isCollisionEnabled: boolean;
  isTextureEnabled: boolean;

  textureID: string;
}

interface Textureable {
  bitmap: ImageBitmap;
  size: Vectorable;
  frameSize: Vectorable;
  frameDuration: number;
  frameCount: Vectorable;
}

type ElementDefaultProperties = {
  position: Vectorable;
  velocity: Vectorable;
  rotation: Vectorable;
  size: Vectorable;
  isDebugEnabled: boolean;
}

type ElementState = {
  position: Vectorable;
  velocity: Vectorable;
  size: Vectorable;
};

type SceneEnvironment = {
  background: string;
  gravity: Vectorable;
}
