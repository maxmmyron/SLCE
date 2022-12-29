
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
  isDebugEnabled?: boolean;
}
