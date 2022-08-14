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

  }

  // ****************************************************************
  // Pubic defs

  /**
   * Notifies engine that an actor should be disposed of at next update cycle.
   * @type {Boolean}
   */
  disposalQueued = false;

  /**
   * Calls draw callback function for actor.
   * @param {CanvasRenderingContext2D} ctx - canvas context to draw to
   */
  draw = (ctx) => {
    this.#drawCallback(ctx);
  }

  /**
   * Calls update callback function for actor
   * @param {Number} dt - update delta time
   * @param {Object} env - environment variables defined by engine
   */
  update = (dt, env) => {
    this.vel += env.physics.accel;
    this.#updateCallback(dt);
  }

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