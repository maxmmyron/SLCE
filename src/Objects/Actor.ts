import { vec, add, sub, div, mult } from "../math/vector";
import Scene from "../core/scene";

/**
 * An actor that can be added to the engine and manipulated.
 *
 * @type {Actor}
 * @class
 */
export default class Actor {
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  readonly scene: Scene;

  readonly name: string;

  isTickEnabled: boolean = true;

  isRenderEnabled: boolean = true;

  isGravityEnabled: boolean = true;

  isCollisionEnabled: boolean = true;

  isTextureEnabled: boolean = true;

  /**
   * Whether or not the actor is queued to be removed from the engine at the
   * next tick.
   *
   * @default false
   */
  isQueuedForDisposal: boolean = false;

  /**
   * Whether or not the actor will draw debug information.
   *
   * @default false
   */
  isDebugEnabled: boolean = false;

  /**
   * Current position of actor; calculated from top left corner of actor.
   */
  pos: Vector;

  /**
   * Current bounds of actor.
   */
  size: Vector;

  /**
   * The current texture ID to draw for the actor.
   * Overridden by AnimationID if animation is active.
   *
   * @default ""
   */
  textureID: string = "";

  vel: Vector;

  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS (w/ getters)
  // ****************************************************************

  private readonly internalID: string;

  private _textureFrame: number = 0;

  private _textures: { [key: string]: Texture } = {};


  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS (w/o getters)
  // ****************************************************************

  /**
   * Current sum of delta time for a given animation frame.
   * When this exceeds the duration for the current animation frame,
   * the animation frame is incremented.
   */
  private textureDeltaSum: number = 0;

  /**
   * A struct containing previous state of the actor.
   */
  private previousState: ActorState;

  /**
   * The offset to start drawing the texture from the top left corner of the actor.
   */
  private textureSourcePosition: Vector = vec(0, 0);

  /**
   * Whether or not interpolation should be factored in when calculating the
   * position of the actor. This is disabled for one frame when the actor is
   * moved using SetPosition()
   */
  private isInterpolationEnabled: boolean = true;


  // ****************************************************************
  // ⚓ CONSTRUCTOR
  // ****************************************************************

  /**
   * Creates a new Actor instance.
   *
   * @constructor
   *
   * @param properties optional arguments for actor upon initialization
   * @param properties.pos position of the actor with respect to canvas origin
   * @param properties.vel velocity of the actor
   * @param properties.size size of the actor
   * @param properties.isDebugEnabled whether or not the actor will draw debug information
   */
  constructor(name: string, scene: Scene, properties?: ActorProperties) {
    this.name = name;

    this.internalID = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    this.scene = scene;

    this.scene.actors.set(this.internalID, this);

    this.pos = properties?.pos || vec(0, 0);
    this.vel = properties?.vel || vec(0, 0);
    this.size = properties?.size || vec(0, 0);

    this.previousState = this.getState();
    this.isDebugEnabled = properties?.isDebugEnabled || false;
  }

  // ****************************************************************
  // ⚓ PUBLIC METHODS
  // ****************************************************************

  /**
   * Preload function called once before the first frame cycle.
   * Accepts a function that will run before the update cycle begins.
   * Primarily used to load assets and initialize textures or animations.
   */
  preload: () => Promise<void> = async () => Promise.resolve();

  addTexture = (textureID: string, texture: ImageBitmap, frameSize: Vector = vec(), frameDuration: number = 200) => {
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
   * Calls update callback function for actor
   *
   * @param timestep - update timestep
   */
  tick = (timestep: number) => {
    if (!this.isTickEnabled || this.isQueuedForDisposal) return;

    // ****************************************************************
    // pre-update operations

    // round down position and velocity if less than EPSILON
    if (Math.abs(this.pos.x) < Number.EPSILON) this.pos.x = 0;
    if (Math.abs(this.pos.y) < Number.EPSILON) this.pos.y = 0;
    if (Math.abs(this.vel.x) < Number.EPSILON) this.vel.x = 0;
    if (Math.abs(this.vel.y) < Number.EPSILON) this.vel.y = 0;

    this.previousState = this.getState();

    // ****************************************************************
    // primary update operations

    if (this.isGravityEnabled) {
      this.vel = add(this.vel, div(this.scene.environment.gravity, timestep));
    }


    if (this.textureID && this.isTextureEnabled) this.updateTexture(timestep);
  };

  /**
   * Calls draw callback function for actor.
   *
   * @param interp - interpolated time between current delta and target timestep
   */
  render = (interp: number) => {
    if (!this.isRenderEnabled || this.isQueuedForDisposal) return;

    const ctx: CanvasRenderingContext2D = this.scene.engine.ctx;

    // interpolate position based on previous frame
    if (this.isInterpolationEnabled) {
      this.pos = add(this.previousState.pos, mult(sub(this.pos, this.previousState.pos), interp));
    }
    this.isInterpolationEnabled = true;

    ctx.save();

    if (this.textureID) this.renderTexture(ctx);

    ctx.restore();

    if (this.isDebugEnabled) this.renderDebug(ctx);
  };

  addListener = (eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)) => this.scene.engine.eventHandler.addListener(eventName, callback);

  removeListener = (eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)) => this.scene.engine.eventHandler.removeListener(eventName, callback);

  /**
   * Immediately moves the actor to the specified position. Disables
   * interpolation for the next frame.
   * @param pos position to move actor to
   */
  setPosition = (pos: Vector): void => {
    this.pos = pos;
    this.isInterpolationEnabled = false;
  }

  // ****************************************************************
  // ⚓ PRIVATE METHODS
  // ****************************************************************

  /**
   * Tracks delta time and increments the current animation frame if
   * delta time exceeds the duration of the current frame.
   *
   * @param delta the current delta time for the update loop
   */
  private updateTexture = (timestep: number) => {
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

  private renderTexture = (ctx: CanvasRenderingContext2D) => {
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
      this.pos.x,
      this.pos.y,
      // vector representing width/height at which to render source bitmap to
      // canvas (if actor size not specified, use texture frame size)
      renderSize.x,
      renderSize.y
    );
  };

  private getState = (): ActorState => {
    return {
      pos: this.pos,
      vel: this.vel,
      size: this.size,
    };
  };

  // ****************************************************************
  // ⚓ DEBUG METHODS
  // ****************************************************************

  /**
   * Renders debug information
   *
   * @param ctx canvas context to render debug information to
   */
  private renderDebug = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    // draw bounds border
    ctx.strokeStyle = "red";
    ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

    ctx.fillStyle = "white";
    ctx.font = "11px monospace";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;

    const texts: string[] = [
      `pos: ${this.pos.x}, ${this.pos.y}`,
      `vel: ${this.vel.x}, ${this.vel.y}`,
    ];

    texts.forEach((text, i) => {
      ctx.fillText(text, this.pos.x, this.pos.y - 12 * (i + 0.5));
    });

    ctx.restore();
  };

  // ****************************************************************
  // ⚓ PRIVATE DECLARATION GETTERS
  // ****************************************************************

  get ID(): string {
    return this.internalID;
  }

  get textures(): { [key: string]: Texture } {
    return this._textures;
  }

  get textureFrame(): number {
    return this._textureFrame;
  }
}
