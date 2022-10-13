import { vec, add, sub, div, mult } from "../math/Vector";

import { assertIsVector } from "../util/Asserts";
import EventSubscriber from "../core/EventSubscriber";
import { textureMixin } from "../util/TextureMixin";
import { animationMixin } from "../util/AnimationMixin";

/**
 * An actor that can be added to the engine and manipulated.
 *
 * @type {Actor & TextureMixin}
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
  constructor(properties = {}) {
    super();

    // Provide mixins for texture and animation functionality
    Object.assign(this, textureMixin);
    Object.assign(this, animationMixin);

    // set default pos and vel
    // assert that provided pos and vel are vectors
    if (assertIsVector(properties.pos ?? vec()))
      this.#last.pos = this.pos = properties.pos ?? vec();

    if (assertIsVector(properties.vel ?? vec()))
      this.#last.vel = this.vel = properties.vel ?? vec();

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

  /**
   * Current position of actor. Defaults to a zero-vector on initialization
   *
   * @type {Vector}
   */
  pos;

  /**
   * Size of bounds actor, as calculated from center of actor. Defaults to a zero-vector on initialization
   *
   * @type {Vector}
   */
  size;

  /**
   * Current velocity of actor. Defaults to a zero-vector on initialization
   *
   * @type {Vector}
   */
  vel;

  draw = null;

  update = null;

  /**
   * Preload function is called once before the first draw cycle.
   * Accepts a function to run as a preload function, and a function
   * that is called after the preload function is finished.
   *
   * @param {Function} callback a function to run as a preload function
   *
   * @returns {Promise} a promise that resolves when the preload function is finished
   */
  preload = (callback, onFulfilled) => {
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
  performUpdates = (timestep, env) => {
    // ****************************************************************
    // pre-update operations

    // round down position and velocity if less than EPSILON
    if (Math.abs(this.pos.x) < Number.EPSILON) this.pos.x = 0;
    if (Math.abs(this.pos.y) < Number.EPSILON) this.pos.y = 0;
    if (Math.abs(this.vel.x) < Number.EPSILON) this.vel.x = 0;
    if (Math.abs(this.vel.y) < Number.EPSILON) this.vel.y = 0;

    this.#last.pos = this.pos;
    this.#last.vel = this.vel;

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
  performDrawCalls = (ctx, interp) => {
    // ****************************************************************
    // pre-draw operations

    // interpolate position of actor based on interpolation provided by engine loop
    this.pos = add(this.#last.pos, mult(sub(this.pos, this.#last.pos), interp));

    // ****************************************************************
    // primary draw operations

    ctx.save();

    // draw texture information
    console.log(this.textures);

    // call user-defined update callback function
    if (this.draw) this.draw(ctx, interp);

    // ****************************************************************
    // restore & debug operations

    // restore canvas context to previous state so we don't clip debug content
    ctx.restore();

    if (this.isDebugEnabled) this.#drawDebug(ctx);
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
  #last = {
    pos: vec(),
    vel: vec(),
  };

  // ****************************************************************
  // Draw debug information

  #drawDebug = (ctx) => {
    ctx.save();

    // draw bounds border
    ctx.strokeStyle = "red";
    ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

    ctx.fillStyle = "white";

    const texts = [
      `pos: ${this.pos.x}, ${this.pos.y}`,
      `vel: ${this.vel.x}, ${this.vel.y}`,
      `isClippedToSize: ${this.isClippedToSize}`,
    ];

    texts.forEach((text, i) => {
      ctx.fillText(text, this.pos.x, this.pos.y - 12 * (i + 0.5));
    });

    ctx.restore();
  };
}
