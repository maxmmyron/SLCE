interface AnimationManager {
  animations: { [index: string]: AnimationState };
  animationID: string;
  animationFrame: number;
  deltaSum: number;
}

interface AnimationState {
  textureID: string;
  frames: Array<AnimationKeyframe>;
}

interface TextureManager {
  textures: { [index: string]: Texture };
  textureID: string;
  textureOffset: Vector;
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
