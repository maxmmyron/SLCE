interface Elementable {
  readonly name: string;
  readonly engine: Engineable;

  isQueuedForDisposal: boolean;
  isRenderEnabled: boolean;
  isTickEnabled: boolean;
  isDebugEnabled: boolean;

  position: Vector;
  velocity: Vector;
  rotation: Vector;
  size: Vector;

  addListener(event: ValidEventType, callback: ((event: ValidEventPayload) => void)): void;
  removeListener(event: ValidEventType, callback: ((event: ValidEventPayload) => void)): void;

  start(): Promise<any>;

  preload(): Promise<any>;

  tick(frameTimestep: number): void;

  render(interpolationFactor: number): void;

  setPosition(position: Vector): void;

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
  size: Vector;
  frameSize: Vector
  frameDuration: number;
  frameCount: Vector;
}

type ElementDefaultProperties = {
  position: Vector;
  velocity: Vector;
  rotation: Vector;
  size: Vector;
  isDebugEnabled: boolean;
}

type ElementState = {
  position: Vector;
  velocity: Vector;
  size: Vector;
};

type SceneEnvironment = {
  background: string;
  gravity: Vector;
}
