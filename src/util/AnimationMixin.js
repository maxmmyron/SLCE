import { vec } from "../math/Vector";
import { assert } from "./Asserts";

/**
 * Animation helper mixin for Actor class.
 *
 * @typedef {Object} AnimationMixin
 * @namespace AnimationMixin
 */
export const animationMixin = {
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
   * @type {String}
   * @default null
   */
  animationID: null,

  /**
   * Current frame of animation for a given animation state.
   *
   * @type {Number}
   * @default 0
   */
  animationFrame: 0,

  /**
   * Current sum of delta time for a given animation frame.
   * When this exceeds the duration for the current animation frame,
   * the animation frame is incremented.
   *
   * @type {Number}
   * @default 0
   */
  deltaSum: 0,

  /**
   * Adds a new AnimationState object to the list of animation states for the actor.
   *
   * @param {String} animationID animationID to identify animation state by. Must be unqiue
   * @param {String} textureID Texture identifier to use to render animation frames
   * @param {Object} options (optional) options for animation state
   * @param {Number} options.frameCount (optional) number of frames in animation. Defaults to the number of frames in the texture starting from startIndex (if provided)
   * @param {Number} options.startIndex (optional) index of first frame in animation. Defaults to 0 if not provided
   * @param {Number} options.frameDuration (optional) duration of each frame in animation, in milliseconds. Defaults to 200 if not provided
   * @param {Object} options.frames (optional) a more verbose way to directly specify duration.
   *
   * @returns true if animation state was successfully added to actor
   *
   * @throws {Error} animationID must be unique
   * @throws {Error} textureID must exist in actor's textures
   * @throws {Error} frameCount must be positive and less than provided texture's frame count.
   * @throws {Error} startIndex must be positive and less than provided texture's frame count.
   * @throws {Error} frameDuration must be positive and less than provided texture's frame count.
   */
  addAnimationState: (animationID, textureID, options) => {
    assert(!this.animationStates[animationID], `Animation ID already exists`);
    assert(this.textures[textureID], `textureID must be valid`);

    texture = this.textures[textureID];

    // extract options and set defaults if not provided
    const {
      frameCount = null,
      startIndex = 0,
      frameDuration = 200,
      frames = null,
    } = options;

    // if frameCount is not provided, set it to the number of frames in the texture - starting index
    if (frameCount !== null) {
      assert(
        frameCount > 0 && frameCount <= texture.frameCount,
        `frameCount must be between 1 and ${texture.frameCount}`
      );
    } else frameCount = texture.frameCount - startIndex;

    // ensure startIndex within 0 and frameCount
    assert(
      startIndex > 0 && startIndex < texture.frameCount,
      `startIndex must be a valid index within ${texture.frameCount}`
    );

    // assert frameDuration is positive
    assert(frameDuration > 0, `frameDuration must be positive`);

    if (!frames) {
      // if frames is not provided, create an equivalent frame
      // object based on the frameCount, startIndex, and frameDuration.
      this.animationStates[animationID] = {
        textureID,
        frames: Array(frameCount).map((_, i) => {
          return {
            index: startIndex + i,
            duration: frameDuration,
          };
        }),
      };
    } else {
      // if frames is provided, use it directly
      this.animationStates[animationID] = {
        textureID,
        frames,
      };
    }

    return true;
  },

  /**
   * Removes an AnimationState from the list of animation states for the actor.
   * If the animation state is active, then the animation state is set to null
   * and reset additional animation properties.
   *
   * @param {String} animationID identifier of AnimationState to remove
   * @returns true if successful
   *
   * @throws {Error} animationID must exist
   */
  removeAnimationState: (animationID) => {
    assert(this.animationStates[animationID], `animationID must be valid`);

    this.animationID = null;
    this.animationFrame = 0;

    delete this.animationStates[animationID];

    return true;
  },

  /**
   * Sets a new active AnimationState for the actor. If a previous animation state was active, then reset the current frame to 0.
   *
   * @param {String} animationID identifier to set as current AnimationState
   * @returns true if successful
   *
   * @throws {Error} animationID must exist
   */
  setAnimationState: (animationID) => {
    assert(this.animationStates[animationID], `animationID must be valid`);

    if (this.animationID) this.animationFrame = 0;

    this.animationID = animationID;

    return true;
  },

  /**
   * Tracks delta time and increments the current animation frame if
   * delta time exceeds the duration of the current frame.
   *
   * @param {Number} delta the current delta time for the update loop
   */
  updateAnimation: (delta) => {
    if (!this.animationID) return;

    this.deltaSum += delta;

    const animationState = this.animationStates[this.animationID];

    const currentFrame = animationState.frames[this.animationFrame];

    if (this.deltaSum >= currentFrame.duration) {
      this.deltaSum -= currentFrame.duration;

      this.animationFrame =
        (this.animationFrame + 1) % animationState.frames.length;
    }

    currentFrame = animationState.frames[this.animationFrame];

    texture = this.textures[animationState.textureID];

    imageBitmap = texture.imageBitmap;
    spriteSize = texture.spriteSize;

    spriteRowCount = imageBitmap.width / spriteSize.x;
    spriteColumnCount = imageBitmap.height / spriteSize.y;

    this.textureOffset = vec(
      (animationFrame % spriteRowCount) * spriteSize.x,
      Math.floor(animationFrame / spriteRowCount) * spriteSize.y
    );
  },
};
