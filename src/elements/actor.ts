import { isVariableDeclarationList } from "typescript";
import Vector2D from "../math/vector2d";
import Element from "./element";

/**
 * An actor that can be added to the engine and manipulated.
 */
export default class Actor extends Element {
  readonly scene: Sceneable;

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

  private renderPosition: Vector2D = new Vector2D();

  private _textures: { [key: string]: Textureable } = {};


  /**
   * Current sum of delta time for a given animation frame.
   * When this exceeds the duration for the current animation frame,
   * the animation frame is incremented.
   */
  private textureDeltaSum: number = 0;

  /**
   * The offset to start drawing the texture from the top left corner of the actor.
   */
  private textureSourcePosition: Vector2D = new Vector2D();


  /**
   * Creates a new Actor instance.
   *
   * @param name name of actor
   * @param scene scene reference to add actor to
    * @param defaultProperties default properties to apply at creation
   */
  constructor(name: string, scene: Sceneable, defaultProperties: Partial<ElementDefaultProperties> = {}) {
    super(name, scene.engine, defaultProperties);

    this.scene = scene;

    this.scene.actors.set(this.ID, this);

    this.previousState = this.createLastState();
    this.isDebugEnabled = defaultProperties?.isDebugEnabled || false;

    this.engine.parameterGUI.baseSection.getSubsectionByTitle(scene.name)
      .addSubsection(this.name, false)
      .addParameter("Position", () => this.position)
      .addParameter("Render Position", () => this.renderPosition)
      .addParameter("Velocity", () => this.velocity)
      .addParameter("Texture ID", () => this.textureID)
  }

  override internalTick = (timestep: number): void => {
    if (this.isGravityEnabled) {
      this.velocity.add(this.scene.environment.gravity.divide(timestep));
    }

    if (this.textureID && this.isTextureEnabled) this.updateTexture(timestep);
  };

  override internalRender = (ctx: CanvasRenderingContext2D, interpolationFactor: number): void => {
    this.renderPosition = this.position.add(this.position.subtract(this.scene.camera.position).multiply(interpolationFactor));

    ctx.save();
    if (this.textureID) this.renderTexture(ctx);

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
  addTexture = (textureID: string, texture: ImageBitmap, frameSize: Vector2D = new Vector2D(), frameDuration: number = 200): void => {
    const textureSize: Vector2D = new Vector2D(texture.width, texture.height);

    if (frameSize.x === 0 || frameSize.y === 0) {
      frameSize = textureSize;
    }

    this._textures[textureID] = {
      bitmap: texture,
      size: textureSize,
      frameSize,
      frameDuration,
      frameCount: new Vector2D(Math.floor(textureSize.x / frameSize.x), Math.floor(textureSize.y / frameSize.y)),
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
    let texture: Textureable = this._textures[this.textureID];

    if ((this.textureDeltaSum += timestep) >= texture.frameDuration) {
      this.textureDeltaSum -= texture.frameDuration;

      this._textureFrame =
        (this._textureFrame + 1) % (texture.frameCount.x * texture.frameCount.y);
    } else return;

    this.textureSourcePosition = new Vector2D(
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
    const texture: Textureable = this._textures[this.textureID];

    const renderSize = this.size || texture.frameSize;

    ctx.drawImage(
      texture.bitmap,
      this.textureSourcePosition.x,
      this.textureSourcePosition.y,
      texture.frameSize.x,
      texture.frameSize.y,
      this.renderPosition.x,
      this.renderPosition.y,
      renderSize.x,
      renderSize.y,
    );
  };

  /**
   * Renders debug information
   *
   * @param ctx canvas context to render debug information to
   */
  private renderDebug = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();

    ctx.strokeStyle = "red";
    ctx.strokeRect(this.renderPosition.x, this.renderPosition.y, this.size.x, this.size.y);

    ctx.restore();
  };

  get textures(): { [key: string]: Textureable } {
    return this._textures;
  }

  get textureFrame(): number {
    return this._textureFrame;
  }
}
