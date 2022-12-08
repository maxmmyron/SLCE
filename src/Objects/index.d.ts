interface AnimationState {
  textureID: string;
  frames: Array<AnimationKeyframe>;
}

interface AnimationKeyframe {
  index: number;
  duration: number;
}

interface Texture {
  imageBitmap: ImageBitmap;
  spriteSize: Vector;
  frameCount: number;
}

type ActorProperties = {
  pos?: Vector;
  vel?: Vector;
  isDebugEnabled?: boolean;
}
