import { vec, add, sub, div, mult } from "../math/Vector";

import { assert, assertIsVector } from "../util/Asserts";
import EventSubscriber from "../core/EventSubscriber"
import { resolveImageBitmap } from "../util/Texture";

/**
 * An actor that can be added to the engine and manipulated.
 *
 * @type {Actor}
 */
export default class Actor extends EventSubscriber {
  /**
   * Creates a new Actor instance.
   *
   * @constructor
   *
   * @param {Object} properties optional arguments for actor upon initialization
   * @param {Vector} properties.pos position of the actor with respect to canvas origin
   * @param {Vector} properties.vel velocity of the actor
   * @param {Vector} properties.size size of the actor
   * @param {Boolean} properties.isDebugEnabled whether or not the actor will draw debug information
   */
  constructor(properties: any = {}) {
    super();

    // set default pos and vel
    // assert that provided pos and vel are vectors
    if (assertIsVector(properties.pos ?? vec()))
      this.last.pos = this.pos = properties.pos ?? vec();

    if (assertIsVector(properties.vel ?? vec()))
      this.last.vel = this.vel = properties.vel ?? vec();

    if (!properties.size)
      throw new Error(`Error initializing actor: Size is not defined`);
    if (!assertIsVector(properties.size))
      throw new Error(`Error initializing actor: Size is not a vector`);

    this.size = properties.size;

    this.isDebugEnabled = properties.isDebugEnabled ?? false;
  }

  // ****************************************************************
  // Public defs

  /**
   * Notifies engine that an actor should be disposed of at next update cycle.
   * @type {Boolean}
   */
  willDispose = false;

  isDebugEnabled = false;

  animationManager: AnimationManager = {
    /**
     * Contains all animation states for an actor, each keyed with a unique identifier.
     *
     * @type {Object}
     * @default {}
     */
    animationStates: {},

    /**
     * Current animation state to animate for actor.
     * Overrides textureID if set.
     *
     * @type {string | null}
     * @default null
     */
    animationID: null,

    /**
     * Current frame of animation for a given animation state.
     *
     * @type {number}
     * @default 0
     */
    animationFrame: 0,

    /**
     * Current sum of delta time for a given animation frame.
     * When this exceeds the duration for the current animation frame,
     * the animation frame is incremented.
     *
     * @type {number}
     * @default 0
     */
    deltaSum: 0,
  };

  textureManager: TextureManager = {
    /**
     * An array of texture objects, assigned by textureID keys.
     *
     * @type {Object}
     * @default {}
     */
    textures: {},

    /**
     * The current texture ID to draw for the actor.
     * Overridden by AnimationID if animation is active.
     *
     * @type {string | null}
     * @default null
     */
    textureID: null,

    /**
     * The offset to start drawing the texture from the top left corner of the actor.
     *
     * @type {Vector}
     * @default vec()
     */
    textureOffset: vec(),
  };

  /**
   * Current position of actor. Defaults to a zero-vector on initialization
   *
   * @type {Vector}
   */
  pos: Vector;

  /**
   * Size of bounds actor, as calculated from center of actor. Defaults to a zero-vector on initialization
   *
   * @type {Vector}
   */
  size: Vector;

  /**
   * Current velocity of actor. Defaults to a zero-vector on initialization
   *
   * @type {Vector}
   */
  vel: Vector;

  draw: Function | null = null;

  update: Function | null = null;

  /**
   * Adds a new AnimationState object to the list of animation states for the actor.
   *
   * @param {string} animationID unique identifier to assign to the animation state
   * @param {string} textureID unique identifier of the texture to use for the animation state
   * @param {any} options optional arguments for animation state upon initialization
   * @param {number} options.frameCount (optional) number of frames in animation. Defaults to the number of frames in the texture starting from startIndex (if provided)
   * @param {number} options.startIndex (optional) index of first frame in animation. Defaults to 0 if not provided
   * @param {number} options.frameDuration (optional) duration of each frame in animation, in milliseconds. Defaults to 200 if not provided
   * @param {any} options.frames (optional) a more verbose way to directly specify duration.
   *
   * @returns {boolean} true if animation state was added successfully
   *
   * @throws {Error} animationID must be unique
   * @throws {Error} textureID must exist in actor's textures
   * @throws {Error} frameCount must be positive and less than provided texture's frame count.
   * @throws {Error} startIndex must be positive and less than provided texture's frame count.
   * @throws {Error} frameDuration must be positive and less than provided texture's frame count.
   */
  addAnimationState = (animationID: string, textureID: string, options: {frameCount: number, startIndex: number, frameDuration: number, frames: Array<AnimationKeyframe>}) : boolean => {
    assert(!this.animationManager.animationStates[animationID], `animationID must be unique`);

    const texture: Texture = this.textureManager.textures[textureID];

    // extract options and set defaults if not provided
    const {
      startIndex = 0,
      frameDuration = 200,
      frames = null,
    } = options;

    let { frameCount = texture.frameCount - startIndex } = options;

    // assert various conditions
    assert(frameCount > 0, `frameCount must be positive`);
    assert(frameCount <= texture.frameCount, `frameCount must be less than provided texture's frame count.`);

    assert(startIndex >= 0, `startIndex must be 0 or greater`);
    assert(startIndex < texture.frameCount, `startIndex must be less than provided texture's frame count.`);

    assert(frameDuration > 0, `frameDuration must be positive`);

    // create animation state and add it
    if(frames) {
      assert(frames.length > 0, `frames must have at least one frame`);

      const animationState: AnimationState = {
        textureID,
        frames,
      };

      this.animationManager.animationStates[animationID] = animationState;

      return true;
    }
    else {
      // create a new frames array based on frameCount and frameDuration
      const frames: Array<AnimationKeyframe> = Array(frameCount).map((_,i) => {
        return {
          index: startIndex + i,
          duration: frameDuration,
        };
      });

      const animationState: AnimationState = {
        textureID,
        frames
      };

      this.animationManager.animationStates[animationID] = animationState;

      return true;
    }
  };

  /**
   * Removes an AnimationState from the list of animation states for the actor.
   * If the animation state is active, then the animation state is set to null
   * and reset additional animation properties.
   *
   * @param {string} animationID identifier of AnimationState to remove
   * @returns true if successful
   *
   * @throws {Error} animationID must exist
   */
  removeAnimationState = (animationID: string): boolean => {
    assert(this.animationManager.animationStates[animationID], `animationID must exist`);

    this.animationManager.animationID = null;
    this.animationManager.animationFrame = 0;

    delete this.animationManager.animationStates[animationID];

    return true;
  };

  /**
   * Sets a new active AnimationState for the actor. If a previous animation state was active, then reset the current frame to 0.
   *
   * @param {String} animationID identifier to set as current AnimationState
   * @returns true if successful
   *
   * @throws {Error} animationID must exist
   */
  setAnimationState = (animationID: string): boolean => {
    assert(this.animationManager.animationStates[animationID], `animationID must be valid`);

    if (this.animationManager.animationID) this.animationManager.animationFrame = 0;

    this.animationManager.animationID = animationID;

    return true;
  };

  /**
   * Tracks delta time and increments the current animation frame if
   * delta time exceeds the duration of the current frame.
   *
   * @param {number} delta the current delta time for the update loop
   */
  updateAnimation = (delta: number): void => {
    if (!this.animationManager.animationID) return;

    this.animationManager.deltaSum += delta;

    const animationState = this.animationManager.animationStates[this.animationManager.animationID];

    let currentFrame = animationState.frames[this.animationManager.animationFrame];

    if (this.animationManager.deltaSum >= currentFrame.duration) {
      this.animationManager.deltaSum -= currentFrame.duration;

      this.animationManager.animationFrame =
        (this.animationManager.animationFrame + 1) % animationState.frames.length;
    } else return;

    // update current frame
    currentFrame = animationState.frames[this.animationManager.animationFrame];

    const texture = this.textureManager.textures[animationState.textureID];

    const imageBitmap = texture.imageBitmap;
    const spriteSize = texture.spriteSize;

    const spriteRowCount = imageBitmap.width / spriteSize.x;
    const spriteColumnCount = imageBitmap.height / spriteSize.y;

    this.textureManager.textureOffset = vec(
      (this.animationManager.animationFrame % spriteRowCount) * spriteSize.x,
      Math.floor(this.animationManager.animationFrame / spriteColumnCount) * spriteSize.y
    );
  };

  /**
   * Loads a texture from path and assigns it and associated texturing properties to the actor.
   *
   * @param {String} textureID identifier to assign to texture. Must be unique.
   * @param {String} path path to texture image file
   * @param {Object} options (optional) options for texture
   * @param {Number} options.frameCount (optional) number of sprite frames in texture
   * @param {Vector} options.spriteSize size of individual sprite frames. If frameCount is provided this property is required.
   *
   * @returns true if texture was successfully added to actor
   *
   * @throws Error if path is not provided
   * @throws Error if textureID is not unique
   * @throws Error if spriteSize provided is not a positive Vector
   * @throws Error if imageBitmap Promise is rejected
   */
  loadTexture = async (textureID: string, path: string, options: {frameCount: number, spriteSize: Vector}) => {
    // assert path is a valid path
    if (!path) throw new Error(`Error loading texture: Path not provided`);

    // assert textureID is not already in use
    if (this.textureManager.textures[textureID])
      throw new Error(`Error loading texture: Name not provided`);

    // extract options
    const { spriteSize = null, frameCount = 1 } = options;

    if (spriteSize !== null) {
      assertIsVector(spriteSize);
      if (spriteSize.x <= 0 || spriteSize.y <= 0)
        throw new Error(`Error loading texture: spriteSize must be positive`);
    }

    await resolveImageBitmap(path)
      .then((imageBitmap: ImageBitmap) => {
        this.textureManager.textures[textureID] = {
          imageBitmap,
          spriteSize,
          frameCount,
        };
      })
      .catch((err: Error) => {
        throw new Error(`Error loading texture: ${err}`);
      });

    return true;
  };

  /**
   * Unloads a texture from the textures array.
   *
   * @param {string} textureID identifier of texture to remove
   *
   * @returns {boolean} true if texture was successfully removed
   *
   * @throws {Error} textureID must be within texture object
   */
  unloadTexture = (textureID: string): boolean => {
    // assert textureID is in use
    if (!this.textureManager.textures[textureID])
      throw new Error(`Error unloading texture: Texture not found`);

    delete this.textureManager.textures[textureID];

    return true;
  };

  /**
   * Preload function is called once before the first draw cycle.
   * Accepts a function to run as a preload function, and a function
   * that is called after the preload function is finished.
   *
   * @param {Function} callback a function to run as a preload function
   *
   * @returns {Promise} a promise that resolves when the preload function is finished
   */
  preload = (callback: Function, onFulfilled: Function): Promise<any> => {
    return new Promise((resolve, reject) => {
      resolve(callback());
    })
      .then((res) => {
        onFulfilled && onFulfilled(res);
      })
      .catch((err) => {
        console.error(`Error attempting to preload actor: ${err}`);
      });
  };

  /**
   * Calls update callback function for actor
   *
   * @param {Number} timestep - update timestep
   * @param {Object} env - environment variables defined by engine
   */
  performUpdates = (timestep: number, env: any): void => {
    // ****************************************************************
    // pre-update operations

    // round down position and velocity if less than EPSILON
    if (Math.abs(this.pos.x) < Number.EPSILON) this.pos.x = 0;
    if (Math.abs(this.pos.y) < Number.EPSILON) this.pos.y = 0;
    if (Math.abs(this.vel.x) < Number.EPSILON) this.vel.x = 0;
    if (Math.abs(this.vel.y) < Number.EPSILON) this.vel.y = 0;

    this.last.pos = this.pos;
    this.last.vel = this.vel;

    // ****************************************************************
    // primary update operations

    this.vel = add(this.vel, div(env.properties.physics.accel, timestep));

    if (this.update) this.update(timestep, env);
  };

  /**
   * Calls draw callback function for actor.
   *
   * @param {CanvasRenderingContext2D} ctx - canvas context to draw to
   * @param {Number} interp - interpolated time between current delta and target timestep
   */
  performDrawCalls = (ctx: CanvasRenderingContext2D, interp: number): void => {
    // ****************************************************************
    // pre-draw operations

    // interpolate position of actor based on interpolation provided by engine loop
    this.pos = add(this.last.pos, mult(sub(this.pos, this.last.pos), interp));

    // ****************************************************************
    // primary draw operations

    ctx.save();

    // call user-defined update callback function
    if (this.draw) this.draw(ctx, interp);

    // ****************************************************************
    // restore & debug operations

    // restore canvas context to previous state so we don't clip debug content
    ctx.restore();

    if (this.isDebugEnabled) this.drawDebug(ctx);
  };

  // ****************************************************************
  // Private defs

  /**
   * A struct containing last calculated position and velocity of actor. Used when interpolating between draw cycles.
   *
   * @private
   * @type {Object}
   *
   * @property {Vector} pos - last calculated position of actor
   * @property {Vector} vel - last calculated velocity of actor
   */
  private last = {
    pos: vec(),
    vel: vec(),
  };

  // ****************************************************************
  // Draw debug information

  private drawDebug = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    // draw bounds border
    ctx.strokeStyle = "red";
    ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

    ctx.fillStyle = "white";

    const texts = [
      `pos: ${this.pos.x}, ${this.pos.y}`,
      `vel: ${this.vel.x}, ${this.vel.y}`,
    ];

    texts.forEach((text, i) => {
      ctx.fillText(text, this.pos.x, this.pos.y - 12 * (i + 0.5));
    });

    ctx.restore();
  };
}
