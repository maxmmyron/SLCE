import { vec, add, sub, div, mult } from "../math/vector";
import Element from "./element";
import Scene from "./scene";

/**
 * An actor that can be added to the engine and manipulated.
 *
 * @type {Actor}
 * @class
 */
export default class Actor extends Element {
  readonly scene: Scene;

  isGravityEnabled: boolean = true;

  isCollisionEnabled: boolean = true;

  isTextureEnabled: boolean = true;

  /**
   * The current texture ID to draw for the actor.
   * Overridden by AnimationID if animation is active.
   *
   * @default ""
   */
  textureID: string = "";

  private _textureFrame: number = 0;

  private _textures: { [key: string]: Texture } = {};


  /**
   * Current sum of delta time for a given animation frame.
   * When this exceeds the duration for the current animation frame,
   * the animation frame is incremented.
   */
  private textureDeltaSum: number = 0;

  /**
   * The offset to start drawing the texture from the top left corner of the actor.
   */
  private textureSourcePosition: Vector = vec(0, 0);


  /**
   * Creates a new Actor instance.
   *
   * @param name name of actor
   * @param scene scene reference to add actor to
   * @param properties Element properties to apply to actor
   */
  constructor(name: string, scene: Scene, properties?: ElementProperties) {
    super(name, scene.engine, properties);

    this.scene = scene;

    this.scene.actors.set(this.ID, this);

    this.position = properties?.position || vec(0, 0);
    this.velocity = properties?.velocity || vec(0, 0);
    this.size = properties?.size || vec(0, 0);

    this.previousState = this.createLastState();
    this.isDebugEnabled = properties?.isDebugEnabled || false;
  }

  override internalTick = (timestep: number): void => {
    if (this.isGravityEnabled) {
      this.velocity = add(this.velocity, div(this.scene.environment.gravity, timestep));
    }

    if (this.textureID && this.isTextureEnabled) this.updateTexture(timestep);
  };

  override internalRender = (ctx: CanvasRenderingContext2D, interpolationFactor: number): void => {
    ctx.save();
    if (this.textureID) this.renderTexture(ctx);

    // restore the context to its previous state so we don't clip the debug content
    ctx.restore();
    if (this.isDebugEnabled) this.renderDebug(ctx);
  };

  /**
   * Adds a new texture to the internal texture array.
   *
   * @param textureID name of texture to add
   * @param texture resolved texture bitmap
   * @param frameSize the size of a single frame in the texture (defaults to the size of the texture)
   * @param frameDuration the duration of a single frame in the texture (defaults to 200ms)
   */
  addTexture = (textureID: string, texture: ImageBitmap, frameSize: Vector = vec(), frameDuration: number = 200): void => {
    const textureSize = vec(texture.width, texture.height);

    if (frameSize.x === 0 || frameSize.y === 0) {
      frameSize = textureSize;
    }

    this._textures[textureID] = {
      bitmap: texture,
      size: textureSize,
      frameSize,
      frameDuration,
      frameCount: vec(Math.floor(textureSize.x / frameSize.x), Math.floor(textureSize.y / frameSize.y)),
    };
  }

  /**
   * Removes a texture from the textures array.
   *
   * @param textureID identifier of texture to remove
   *
   * @returns {boolean} True if texture was successfully removed. False if textureID does not exist.
   */
  removeTexture = (textureID: string): boolean => {
    if (!this._textures[textureID]) return false;

    delete this._textures[textureID];

    return true;
  };

  /**
   * Tracks delta time and increments the current animation frame if
   * delta time exceeds the duration of the current frame.
   *
   * @param delta the current delta time for the update loop
   */
  private updateTexture = (timestep: number): void => {
    let texture: Texture = this._textures[this.textureID];

    if ((this.textureDeltaSum += timestep) >= texture.frameDuration) {
      this.textureDeltaSum -= texture.frameDuration;

      this._textureFrame =
        (this._textureFrame + 1) % (texture.frameCount.x * texture.frameCount.y);
    } else return;

    this.textureSourcePosition = vec(
      this._textureFrame % texture.frameCount.x * texture.frameSize.x,
      (this._textureFrame - this._textureFrame % texture.frameCount.x) / texture.frameCount.y * texture.frameSize.y
    );
  };

  /**
   * Renders the current texture to the canvas.
   *
   * @param ctx the canvas context to render to
   */
  private renderTexture = (ctx: CanvasRenderingContext2D): void => {
    const texture: Texture = this._textures[this.textureID];

    const renderSize = this.size || texture.frameSize;

    ctx.drawImage(
      // source bitmap
      texture.bitmap,
      // vector of sub-rectangle in source bitmap
      this.textureSourcePosition.x,
      this.textureSourcePosition.y,
      // vector of sub-rectangle in source bitmap
      texture.frameSize.x,
      texture.frameSize.y,
      // vector of destination on canvas (actor pos)
      this.position.x + this.scene.position.x,
      this.position.y + this.scene.position.y,
      // vector representing width/height at which to render source bitmap to
      // canvas (if actor size not specified, use texture frame size)
      renderSize.x,
      renderSize.y
    );
  };

  /**
   * Renders debug information
   *
   * @param ctx canvas context to render debug information to
   */
  private renderDebug = (ctx: CanvasRenderingContext2D): void => {
    const offsetPosition: Vector = add(this.position, this.scene.position);

    ctx.save();

    // draw bounds border
    ctx.strokeStyle = "red";
    ctx.strokeRect(offsetPosition.x, offsetPosition.y, this.size.x, this.size.y);

    ctx.fillStyle = "white";
    ctx.font = "11px monospace";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;

    const texts: string[] = [
      `pos: ${this.position.x}, ${this.position.y}`,
      `vel: ${this.velocity.x}, ${this.velocity.y}`,
    ];

    texts.forEach((text, i) => {
      ctx.fillText(text, offsetPosition.x, offsetPosition.y - 12 * (i + 0.5));
    });

    ctx.restore();
  };

  get textures(): { [key: string]: Texture } {
    return this._textures;
  }

  get textureFrame(): number {
    return this._textureFrame;
  }
}
