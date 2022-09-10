import { vec, add, sub, div, mag } from "../Math/Vector";
import TextureLayer from "../util/TextureLayer";
import EventHandler from "../util/EventHandler";

/**
 * An actor function represents an actor that can be placed within the canvas.
 * @param {Function} draw a draw function that is called every frame
 * @param {Function} update an update function that is called every frame
 * @param {Object} initialProperties optional arguments for velocity and position
 * @property {Vector} initialProperties.pos - starting position of actor (with respect to origin of canvas)
 * @property {Vector} initialProperties.vel - velocity of actor
 * @property {Number} initialProperties.bounds.size - size of actor's bounds
 * @property {Number} initialProperties.zIndex - z-index of actor. -1 will draw actor behind canvas.
 */
export default class Actor {
  constructor(properties = {}) {
    // set velocity and position to values passed in initialProperties;
    // if not provided, set to 0
    this.pos = properties.pos ?? vec();
    this.vel = properties.vel ?? vec();

    this.size = properties.size ?? vec();

    // create a new event handler for handling events called during preload, draw, and update cycles.
    this.eventHandler = new EventHandler(["preload", "draw", "update"]);

    this.#last.pos = this.pos;
    this.#last.vel = this.vel;
  }

  // ****************************************************************
  // Pubic defs

  /**
   * An EventHandler object for accessing and handling engine events
   *
   * @type {EventHandler}
   */
  eventHandler;

  /**
   * Current position of actor. Defaults to a zero-vector on initialization
   *
   * @type {Vector}
   */
  pos;

  /**
   * Current velocity of actor. Defaults to a zero-vector on initialization
   *
   * @type {Vector}
   */
  vel;

  /**
   * Size of bounds actor, as calculated from center of actor. Defaults to a zero-vector on initialization
   */
  size;

  /**
   * An array of TextureLayer objects that are incrementally drawn to the canvas for each draw cycle.
   *
   * @type {Array<TextureLayer>}
   */
  textures = [];

  /**
   * A struct containing actor properties beyond those most commonly used.
   *
   * @type {Object}
   *
   * @property {Number} zIndex z-index of actor; used in ordering draw of actor. -1 will draw actor behind canvas.
   */
  properties = {
    zIndex: 0,
  };

  /**
   * Notifies engine that an actor should be disposed of at next update cycle.
   * @type {Boolean}
   */
  disposalQueued = false;

  /**
   * Adds a new texture layer to the actor.
   *
   * @param {TextureLayer} textureLayer TextureLayer object to attempt to add to actor
   */
  addTextureLayer = (textureLayer) =>
    new Promise((resolve, reject) => {
      textureLayer
        .resolveImageBitmap()
        .then(() => {
          this.textures.push(textureLayer);
          resolve("Success");
        })
        .catch((err) => {
          reject(`Error adding texture layer to actor: ${err}`);
        });
    });

  /**
   * Preload function is called once before the first draw cycle.
   * Accepts a function to run as a preload function, and a function
   * that is called after the preload function is finished.
   *
   * @param {Function} preloadCallback a function to run as a preload function
   * @param {Function} postloadCallback a function to run after the preload function is finished
   *
   * @returns {Promise} a promise that resolves when the preload function is finished
   *
   */
  preload = (preloadCallback, postloadCallback) => {
    return new Promise((resolve, reject) => {
      resolve(preloadCallback());
    })
      .then(() => {
        this.eventHandler.eventHandlers["preload"].forEach((callback) =>
          callback()
        );
        postloadCallback();
      })
      .catch((err) => {
        reject(`Error in preload function: ${err}`);
      });
  };

  /**
   * Calls draw callback function for actor.
   *
   * @param {CanvasRenderingContext2D} ctx - canvas context to draw to
   * @param {Number} interp - interpolated time between current delta and target timestep
   */
  draw = (ctx, interp) => {
    // interpolate position of actor based on interpolation value
    this.pos = {
      x: this.#last.pos.x + (this.pos.x - this.#last.pos.x) * interp,
      y: this.#last.pos.y + (this.pos.y - this.#last.pos.y) * interp,
    };

    const negTextureLayers = this.textures.filter(
      (textureLayer) => textureLayer.properties.zIndex < 0
    );
    const posTextureLayers = this.textures.filter(
      (textureLayer) => textureLayer.properties.zIndex >= 0
    );

    // draw texture layers with a z-index below 0
    if (negTextureLayers.length > 0) {
      this.#drawTextureLayers(ctx, negTextureLayers);
    }

    // call draw callback function
    if (this.eventHandler.eventHandlers["draw"][0])
      this.eventHandler.eventHandlers["draw"][0](ctx);

    // draw texture layers with a z-index geater than 0
    if (posTextureLayers.length > 0) {
      this.#drawTextureLayers(ctx, posTextureLayers);
    }
  };

  /**
   * Calls update callback function for actor
   *
   * @param {Number} timestep - update timestep
   * @param {Object} env - environment variables defined by engine
   */
  update = (timestep, env) => {
    this.#last.pos = this.pos;
    this.#last.vel = this.vel;

    this.vel.x += env.physics.accel.x / timestep;
    this.vel.y += env.physics.accel.y / timestep;

    if (this.eventHandler.eventHandlers["update"][0])
      this.eventHandler.eventHandlers["update"][0](timestep, env);
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

  #drawTextureLayers = (ctx, textureLayers) => {
    textureLayers.forEach((textureLayer) => {
      const offsetPos = sub(this.pos, div(textureLayer.properties.size, 2));
      ctx.drawImage(
        textureLayer.imageBitmap,
        offsetPos.x,
        offsetPos.y,
        textureLayer.properties.size.x,
        textureLayer.properties.size.y
      );
    });
  };
}
