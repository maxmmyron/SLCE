interface AnimationManager {
  animations: {[index: string]: AnimationState};
  animationID: string | null;
  animationFrame: number;
  deltaSum: number;
}

interface AnimationState {
  textureID: string;
  frames: Array<AnimationKeyframe>;
}

interface TextureManager {
  textures: {[index: string]: Texture};
  textureID: string | null;
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
  pos: Vector;
  vel: Vector;
  size: Vector;
  isDebugEnabled: boolean;
}
