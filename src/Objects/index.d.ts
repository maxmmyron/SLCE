
interface Texture {
  bitmap: ImageBitmap;
  size: Vector;
  frameSize: Vector
  frameDuration: number;
  frameCount: Vector;
}

type ActorProperties = {
  pos?: Vector;
  vel?: Vector;
  size?: Vector;
  isDebugEnabled?: boolean;
}

type ActorState = {
  pos: Vector;
  vel: Vector;
  size: Vector;
};
