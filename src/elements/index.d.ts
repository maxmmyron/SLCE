interface Texture {
  bitmap: ImageBitmap;
  size: Vector;
  frameSize: Vector
  frameDuration: number;
  frameCount: Vector;
}

type ElementProperties = {
  position?: Vector;
  velocity?: Vector;
  rotation?: Vector;
  size?: Vector;
  isDebugEnabled?: boolean;
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
