import { vec, add, sub, div, mult } from "../math/vector";

import EventSubscriber from "../core/events/event_subscriber"
import { Scene } from "../core/scene";

/**
 * An actor that can be added to the engine and manipulated.
 *
 * @type {Actor}
 * @class
 */
export default class Actor extends EventSubscriber {
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  doUpdate: boolean = true;

  doDraw: boolean = true;

  readonly ID: string;

  /**
   * Current position of actor; calculated from top left corner of actor.
   */
  pos: Vector;

  readonly scene: Scene;

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

  /**
   * Notifies engine that an actor should be disposed of at next update cycle.
   */
  isQueuedForDisposal: boolean = false;

  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS (w/ getters)
  // ****************************************************************

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
   * A struct containing last calculated position and velocity of actor. Used when interpolating between draw cycles.
   *
   * @property {Vector} pos - last calculated position of actor
   * @property {Vector} vel - last calculated velocity of actor
   */
  private lastState = {
    pos: vec(),
    vel: vec(),
  };

  /**
   * The offset to start drawing the texture from the top left corner of the actor.
   */
  private textureSourcePosition: Vector = vec(0, 0);


  // ****************************************************************
  // ⚓ DEBUG DECLARATIONS
  // ****************************************************************

  /**
   * Whether or not the actor will draw debug information.
   *
   * @default false
   */
  isDebugEnabled: boolean = false;


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
  constructor(ID: string, scene: Scene, properties?: ActorProperties) {
    super();

    this.ID = ID;

    this.size = vec(0, 0); // TODO

    this.scene = scene;

    this.scene.actors.set(this.ID, this);

    this.lastState.pos = this.pos = properties?.pos || vec();
    this.lastState.vel = this.vel = properties?.vel || vec();
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
    if (!this.doUpdate) return;

    // ****************************************************************
    // pre-update operations

    // round down position and velocity if less than EPSILON
    if (Math.abs(this.pos.x) < Number.EPSILON) this.pos.x = 0;
    if (Math.abs(this.pos.y) < Number.EPSILON) this.pos.y = 0;
    if (Math.abs(this.vel.x) < Number.EPSILON) this.vel.x = 0;
    if (Math.abs(this.vel.y) < Number.EPSILON) this.vel.y = 0;

    this.lastState.pos = this.pos;
    this.lastState.vel = this.vel;

    // ****************************************************************
    // primary update operations

    this.vel = add(this.vel, div(this.scene.environment.gravity, timestep));

    if (this.textureID) this.updateTexture(timestep);
    // if (this.update) this.update(timestep); TODO: replace with event emitter
  };

  /**
   * Calls draw callback function for actor.
   *
   * @param ctx - canvas context to draw to
   * @param interp - interpolated time between current delta and target timestep
   */
  render = (ctx: CanvasRenderingContext2D, interp: number) => {
    if (!this.doDraw) return;

    // ****************************************************************
    // pre-draw operations

    // interpolate position of actor based on interpolation provided by engine loop
    this.pos = add(this.lastState.pos, mult(sub(this.pos, this.lastState.pos), interp));

    // ****************************************************************
    // primary draw operations

    ctx.save();

    if (this.textureID) this.renderTexture(ctx);

    // call user-defined update callback function
    // if (this.render) this.render(ctx, interp); TODO: replace with event emitter

    // ****************************************************************
    // restore & debug operations

    // restore canvas context to previous state so we don't clip debug content
    ctx.restore();

    if (this.isDebugEnabled) this.renderDebug(ctx);
  };

  // ****************************************************************
  // ⚓ PRIVATE METHODS
  // ****************************************************************

  /**
   * Tracks delta time and increments the current animation frame if
   * delta time exceeds the duration of the current frame.
   *
   * @param delta the current delta time for the update loop
   */
  private updateTexture = (delta: number) => {
    let texture: Texture = this._textures[this.textureID];

    if ((this.textureDeltaSum += delta) >= texture.frameDuration) {
      this.textureDeltaSum -= texture.frameDuration;

      this._textureFrame =
        (this._textureFrame + 1) % (texture.frameCount.x * texture.frameCount.y);
    } else return;

    this.textureSourcePosition = vec(
      this._textureFrame % texture.frameCount.x * texture.size.x,
      (this._textureFrame - this._textureFrame % texture.frameCount.x) / texture.frameCount.y * texture.size.y
    );
  };

  private renderTexture = (ctx: CanvasRenderingContext2D) => {
    const texture: Texture = this._textures[this.textureID];

    ctx.drawImage(
      texture.bitmap,                 // image source
      this.textureSourcePosition.x,   // starting x from source
      this.textureSourcePosition.y,   // starting y from source
      texture.frameSize.x,            // width of source to draw
      texture.frameSize.y,            // height of source to draw
      this.pos.x,                     // actor x on canvas
      this.pos.y,                     // actor y on canvas
      this.size.x,                    // actor width
      this.size.y                     // actor height
    );

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

  get textures(): { [key: string]: Texture } {
    return this._textures;
  }

  get textureFrame(): number {
    return this._textureFrame;
  }
}
