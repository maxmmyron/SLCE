import { vec } from "../Math/Vector";

/**
 * An actor function represents an actor that can be placed within the canvas.
 * @param {Function} draw a draw function that is called every frame
 * @param {Function} update an update function that is called every frame
 * @param {Object} options optional arguments for velocity and position
 */
export default class Actor {
  constructor(drawCallback, updateCallback, options = {}) {
    this.#drawCallback = drawCallback;
    this.#updateCallback = updateCallback;

    // set velocity and position to values passed in options;
    // if not provided, set to 0
    this.vel = options.vel ?? { x: 0, y: 0 };
    this.pos = options.pos ?? { x: 0, y: 0 };

    this.last.pos = this.pos;
    this.last.vel = this.vel;
  }

  // ****************************************************************
  // Pubic defs

  /**
   * Notifies engine that an actor should be disposed of at next update cycle.
   * @type {Boolean}
   */
  disposalQueued = false;

  /**
   * Struct of last calculated state of actor
   */
  last = {
    pos: vec(),
    vel: vec(),
  };

  /**
   * Calls draw callback function for actor.
   * @param {CanvasRenderingContext2D} ctx - canvas context to draw to
   * @param {Number} interp - interpolated time between current delta and target timestep
   */
  draw = (ctx, interp) => {
    // set pos to interpolated position
    this.pos = {
      x: this.last.pos.x + (this.pos.x - this.last.pos.x) * interp,
      y: this.last.pos.y + (this.pos.y - this.last.pos.y) * interp,
    };
    this.#drawCallback(ctx, interp);
  };

  /**
   * Calls update callback function for actor
   * @param {Number} timestep - update timestep
   * @param {Object} env - environment variables defined by engine
   */
  update = (timestep, env) => {
    this.last.pos = this.pos;
    this.last.vel = this.vel;

    this.vel.x += env.physics.accel.x / timestep;
    this.vel.y += env.physics.accel.y / timestep;
    this.#updateCallback(timestep);
  };

  // ****************************************************************
  // Private defs

  /**
   * Callback function for actor's draw method
   * @private
   */
  #drawCallback;

  /**
   * Callback function for actor's update method
   * @private
   */
  #updateCallback;
}
