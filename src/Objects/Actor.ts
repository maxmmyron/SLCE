import { vec, add, sub, div, mult } from "../math/vector";

import { assert } from "../util/asserts";
import EventSubscriber from "../core/events/event_subscriber"
import Engine from "../core/engine";
import { Scene } from "../core/Scene";

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

  vel: Vector;

  /**
   * Notifies engine that an actor should be disposed of at next update cycle.
   */
  isQueuedForDisposal: boolean = false;

  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS (w/ getters)
  // ****************************************************************

  private _animations: { [key: string]: AnimationState } = {};

  // TODO: switch from current animation ID to current animation state
  private _currentAnimationID: string = "";

  private _currentAnimationFrame: number = 0;

  private _textures: { [key: string]: Texture } = {};

  /**
   * The current texture ID to draw for the actor.
   * Overridden by AnimationID if animation is active.
   *
   * @default ""
   */
  private _currentTextureID: string = "";


  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS (w/o getters)
  // ****************************************************************

  /**
   * Current sum of delta time for a given animation frame.
   * When this exceeds the duration for the current animation frame,
   * the animation frame is incremented.
   */
  private animationDeltaSum: number = 0;

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
   * Overridable user-defined function to run on each draw cycle.
   *
   * @param ctx the canvas context to draw to
   * @param interp the interpolation factor for the current draw cycle
   */
  draw: (ctx: CanvasRenderingContext2D, interp: number) => void = () => { };

  /**
   * Overridable user-defined function to run on each update cycle.
   *
   * @param dt the delta time since last update
   */
  update: (dt: number) => void = () => { };

  /**
   * Preload function called once before the first frame cycle.
   * Accepts a function that will run before the update cycle begins.
   * Primarily used to load assets and initialize textures or animations.
   */
  preload: () => Promise<void> = async () => Promise.resolve();

  /**
   * Adds a new AnimationState object to the list of animation states for the actor.
   *
   * @param animationID unique identifier to assign to the animation state
   * @param textureID unique identifier of the texture to use for the animation state
   * @param options optional arguments for animation state upon initialization
   * @param options.frameCount (optional) number of frames in animation. Defaults to the number of frames in the texture starting from startIndex (if provided)
   * @param options.startIndex (optional) index of first frame in animation. Defaults to 0 if not provided
   * @param options.frameDuration (optional) duration of each frame in animation, in milliseconds. Defaults to 200 if not provided
   * @param options.frames (optional) a more verbose way to directly specify duration.
   *
   * @returns {boolean} true if animation state was added successfully
   *
   * @throws {Error} animationID must be unique
   * @throws {Error} textureID must exist in actor's textures
   * @throws {Error} frameCount must be positive and less than provided texture's frame count.
   * @throws {Error} startIndex must be positive and less than provided texture's frame count.
   * @throws {Error} frameDuration must be positive and less than provided texture's frame count.
   */
  addAnimationState = (animationID: string, textureID: string, options: { frameCount: number, startIndex: number, frameDuration: number, frames: Array<AnimationKeyframe> | null } = { frameCount: -1, frameDuration: 200, frames: null, startIndex: 0 }): boolean => {
    assert(!this._animations[animationID], `animationID must be unique`);

    const texture: Texture = this._textures[textureID];

    // extract options and set defaults if not provided
    const {
      startIndex,
      frameDuration,
      frames,
    } = options;

    let { frameCount } = options;

    if (frameCount === -1 && frames === null) {
      frameCount = texture.frameCount - startIndex;
    }

    // assert various conditions
    assert(frameCount > 0, `frameCount must be positive`);
    assert(frameCount <= texture.frameCount, `frameCount must be less than provided texture's frame count.`);

    assert(startIndex >= 0, `startIndex must be 0 or greater`);
    assert(startIndex < texture.frameCount, `startIndex must be less than provided texture's frame count.`);

    assert(frameDuration > 0, `frameDuration must be positive`);

    // create animation state and add it
    if (frames) {
      assert(frames.length > 0, `frames must have at least one frame`);

      const animationState: AnimationState = {
        textureID,
        frames,
      };

      this._animations[animationID] = animationState;

      return true;
    }
    else {
      // create a new frames array based on frameCount and frameDuration
      const frames: Array<AnimationKeyframe> = Array.from({ length: frameCount }, (_, i) => ({
        index: startIndex + i,
        duration: frameDuration,
      }));

      const animationState: AnimationState = {
        textureID,
        frames
      };

      this._animations[animationID] = animationState;

      return true;
    }
  };

  /**
   * Removes an AnimationState from the list of animation states for the actor.
   * If the animation state is active, then the animation state is set to null
   * and reset additional animation properties.
   *
   * @param animationID identifier of AnimationState to remove
   * @returns true if successful
   *
   * @throws {Error} animationID must exist
   */
  removeAnimationState = (animationID: string): boolean => {
    assert(this._animations[animationID], `animationID must exist`);

    this._currentAnimationID = "";
    this._currentAnimationFrame = 0;

    delete this._animations[animationID];

    return true;
  };

  /**
   * Sets a new active AnimationState for the actor. If a previous animation state was active, then reset the current frame to 0.
   *
   * @param animationID identifier to set as current AnimationState
   * @returns true if successful
   *
   * @throws {Error} animationID must exist
   */
  setAnimationState = (animationID: string): boolean => {
    assert(this._animations[animationID], `animationID must be valid`);

    if (this._currentAnimationID) this._currentAnimationFrame = 0;

    this._currentAnimationID = animationID;

    return true;
  };

  /**
   * Creates a new Texture from an existing imageBitmap and assigns it to the actor.
   *
   * @param textureID identifier to assign to texture. Must be unique.
   * @param imageBitmap ImageBitmap to assign to texture
   * @param options (optional) options for texture
   * @param options.frameCount (optional) number of sprite frames in texture
   * @param options.spriteSize size of individual sprite frames. If frameCount is provided this property is required.
   *
   * @returns {boolean} true if texture was successfully added to actor. False if textureID already exists.
   *
   * @throws Error if spriteSize provided is not a positive Vector
   */
  addTexture = (textureID: string, imageBitmap: ImageBitmap, options: { frameCount: number, textureSize: Vector | null } = { frameCount: 1, textureSize: null }): boolean => {
    if (this._textures[textureID]) return false;

    if (!options.textureSize) return false;

    const textureSize: Vector = options.textureSize as Vector;

    // assert spriteSize is a positive Vector
    assert(textureSize.x > 0 && textureSize.y > 0, `Error adding texture: spriteSize must be a positive Vector`);

    this._textures[textureID] = {
      imageBitmap,
      size: textureSize,
      frameCount: options.frameCount
    };

    return true;
  };

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
  performUpdates = (timestep: number) => {
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

    this.updateAnimation(timestep);
    if (this.update) this.update(timestep);
  };

  /**
   * Calls draw callback function for actor.
   *
   * @param ctx - canvas context to draw to
   * @param interp - interpolated time between current delta and target timestep
   */
  performDrawCalls = (ctx: CanvasRenderingContext2D, interp: number) => {
    if (!this.doDraw) return;

    // ****************************************************************
    // pre-draw operations

    // interpolate position of actor based on interpolation provided by engine loop
    this.pos = add(this.lastState.pos, mult(sub(this.pos, this.lastState.pos), interp));

    // ****************************************************************
    // primary draw operations

    ctx.save();

    if (this._currentTextureID) this.drawTexture(ctx);
    if (this._currentAnimationID) this.drawTextureFromMap(ctx);

    // call user-defined update callback function
    if (this.draw) this.draw(ctx, interp);

    // ****************************************************************
    // restore & debug operations

    // restore canvas context to previous state so we don't clip debug content
    ctx.restore();

    if (this.isDebugEnabled) this.drawDebug(ctx);
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
  private updateAnimation = (delta: number) => {
    if (!this._currentAnimationID) return;

    const animationState: AnimationState = this._animations[this._currentAnimationID];

    let currentFrame: AnimationKeyframe = animationState.frames[this._currentAnimationFrame];

    // if deltaSum exceeds
    if ((this.animationDeltaSum += delta) >= currentFrame.duration) {
      this.animationDeltaSum -= currentFrame.duration;

      this._currentAnimationFrame =
        (this._currentAnimationFrame + 1) % animationState.frames.length;
    } else return;

    // update current frame
    currentFrame = animationState.frames[this._currentAnimationFrame];

    const texture: Texture = this._textures[animationState.textureID];

    const imageBitmap: ImageBitmap = texture.imageBitmap;
    const spriteSize: Vector = texture.size;

    const spriteRowCount: number = Math.floor(imageBitmap.width / spriteSize.x);
    const spriteColumnCount: number = Math.floor(imageBitmap.height / spriteSize.y);

    this.textureSourcePosition = vec(
      this._currentAnimationFrame % spriteRowCount * spriteSize.x,
      (this._currentAnimationFrame - this._currentAnimationFrame % spriteRowCount) / spriteColumnCount * spriteSize.y
    );
  };

  /**
   * Draws the current static texture of the actor to the canvas context.
   *
   * @param ctx the canvas context to draw to
   */
  private drawTexture = (ctx: CanvasRenderingContext2D) => {
    const texture: Texture = this._textures[this._currentTextureID];

    const imageBitmap: ImageBitmap = texture.imageBitmap;

    ctx.drawImage(
      imageBitmap,  // image source
      this.pos.x,   // actor x on canvas
      this.pos.y,   // actor y on canvas
      this.size.x,  // actor width
      this.size.y   // actor height
    );
  };

  /**
   * Draws a texture based on the current animation frame of the
   * actor to the canvas context.
   *
   * @param ctx the canvas context to draw to
   */
  private drawTextureFromMap = (ctx: CanvasRenderingContext2D) => {
    const animationState: AnimationState = this._animations[this._currentAnimationID];

    const texture: Texture = this._textures[animationState.textureID];

    const imageBitmap: ImageBitmap = texture.imageBitmap;
    const textureSize: Vector = texture.size;

    ctx.drawImage(
      imageBitmap,            // image source
      this.textureSourcePosition.x,   // starting x from source
      this.textureSourcePosition.y,   // starting y from source
      textureSize.x,           // width of source to draw
      textureSize.y,           // height of source to draw
      this.pos.x,             // actor x on canvas
      this.pos.y,             // actor y on canvas
      this.size.x,            // actor width
      this.size.y             // actor height
    );
  }

  // ****************************************************************
  // ⚓ DEBUG METHODS
  // ****************************************************************

  /**
   * Renders debug information
   *
   * @param ctx canvas context to render debug information to
   */
  private drawDebug = (ctx: CanvasRenderingContext2D) => {
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

  get animations(): { [key: string]: AnimationState } {
    return this._animations;
  }

  get currentAnimationID(): string {
    return this._currentAnimationID;
  }

  get currentAnimationFrame(): number {
    return this._currentAnimationFrame;
  }

  get textures(): { [key: string]: Texture } {
    return this._textures;
  }

  get currentTextureID(): string {
    return this._currentTextureID;
  }
}
