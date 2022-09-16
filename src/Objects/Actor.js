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

    this.size = properties.size ?? vec(48);

    this.isClippedToSize = properties.isClippedToSize ?? true;

    this.isDebugEnabled = properties.isDebugEnabled ?? false;

    // create a new event handler for handling events called during clip, draw, and update cycles.
    this.eventHandler = new EventHandler(["on_draw", "on_update"], true);

    this.#last.pos = this.pos;
    this.#last.vel = this.vel;
  }

  // ****************************************************************
  // Pubic defs

  /**
   * Clip bounds of actor, which represents the region in which draw calls and texture drawing is confined to. If defined, the actor will be clipped to within these bounds.
   * Clip bounds default to null, meaning that the actor will not be clipped. May be defined in one of two states, "clipToSize", or as a function using context draw calls to form a clip region.
   *
   * @type {String|Function}
   * @default null
   *
   * @example
   * // clip to size
   * actor.clipBounds = "clipToSize";
   *
   * @example
   * // clip to a circle
   * actor.clipBounds = (ctx) => {
   *  ctx.arc(0, 0, 48, 0, 2 * Math.PI);
   * }
   *
   */
  clipBounds;

  /**
   * Notifies engine that an actor should be disposed of at next update cycle.
   * @type {Boolean}
   */
  disposalQueued = false;

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

  isDebugEnabled = false;

  /**
   * Adds a new texture layer to the actor.
   *
   * @param {TextureLayer} textureLayer TextureLayer object to attempt to add to actor
   */
  addTextureLayer = (textureLayer) => {
    new Promise((resolve, reject) => {
      if (textureLayer.imageBitmap) {
        this.#textures.push(textureLayer);
        resolve("Success");
      } else {
        textureLayer
          .resolveImageBitmap()
          .then(() => {
            this.#textures.push(textureLayer);
            resolve("Success");
          })
          .catch((err) => {
            reject(`Error adding texture layer to actor: ${err}`);
          });
      }
    });
  };

  /**
   * Adds a callback, if one is not already present, to the event handler for the given event.
   *
   * @param {String} event event to add callback to
   * @param {Function} callback callback to add to event handler
   *
   * @returns true if callback was added, false if callback was already present
   */
  addEventHandler = (event, callback) =>
    this.eventHandler.addEventHandler(event, callback);

  getTextures = () => new Promise((resolve, reject) => resolve(this.#textures));

  /**
   * Calls draw callback function for actor.
   *
   * @param {CanvasRenderingContext2D} ctx - canvas context to draw to
   * @param {Number} interp - interpolated time between current delta and target timestep
   */
  draw = (ctx, interp) => {
    // ****************************************************************
    // perform default draw operations

    // interpolate position of actor based on interpolation provided by engine loop
    this.pos = {
      x: this.#last.pos.x + (this.pos.x - this.#last.pos.x) * interp,
      y: this.#last.pos.y + (this.pos.y - this.#last.pos.y) * interp,
    };

    // split texture layers into those that render below main draw call and those that render above
    const activeTextureLayers = this.#textures.filter(
      (textureLayer) => textureLayer.isActive
    );

    // sort active texture layers by z-index
    activeTextureLayers.sort(
      (a, b) => a.drawProperties.zIndex - b.drawProperties.zIndex
    );

    // ****************************************************************
    // perform draw operations

    ctx.save();

    if (this.isClippedToSize) {
      ctx.beginPath();
      ctx.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
      ctx.clip();
    }

    // draw active texture layers
    activeTextureLayers.forEach((textureLayer) => {
      this.drawTextureLayer(textureLayer, ctx);
    });

    // execute draw callback
    if (this.eventHandler.eventHandlers["on_draw"])
      this.eventHandler.eventHandlers["on_draw"](ctx);

    // restore before we draw debug info, so that debug info is not clipped
    ctx.restore();

    if (this.isDebugEnabled) this.#drawDebug(ctx);
  };

  /**
   * Draws a Texturelayer to the canvas context.
   *
   * @param {TextureLayer} textureLayer
   * @param {CanvasRenderingContext2D} ctx
   */
  drawTextureLayer = (textureLayer, ctx) => {
    switch (textureLayer.drawProperties.tileMode) {
      case "tile": {
        for (let x = 0; x < this.size.x; x += textureLayer.size.x) {
          for (let y = 0; y < this.size.y; y += textureLayer.size.y) {
            ctx.drawImage(
              textureLayer.imageBitmap,
              this.pos.x + x,
              this.pos.y + y,
              textureLayer.size.x,
              textureLayer.size.y
            );
          }
        }
        break;
      }
      case "tileX": {
        for (let x = 0; x < this.size.x; x += textureLayer.size.x) {
          ctx.drawImage(
            textureLayer.imageBitmap,
            this.pos.x + x,
            this.pos.y,
            textureLayer.size.x,
            textureLayer.size.y
          );
        }
        break;
      }
      case "tileY": {
        for (let y = 0; y < this.size.y; y += textureLayer.size.y) {
          ctx.drawImage(
            textureLayer.imageBitmap,
            this.pos.x,
            this.pos.y + y,
            textureLayer.size.x,
            textureLayer.size.y
          );
        }
        break;
      }
      default: {
        ctx.drawImage(
          textureLayer.imageBitmap,
          this.pos.x + textureLayer.pos.x,
          this.pos.y + textureLayer.pos.y,
          textureLayer.size.x,
          textureLayer.size.y
        );
        break;
      }
    }
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
   * Removes a callback from the event handler for the given event.
   *
   * @param {Function} callback - function to remove
   *
   * @returns true if callback was removed, false if callback was not present
   */
  removeEventHandler = (callback) =>
    this.eventHandler.removeEventHandler(callback);

  /**
   * Calls update callback function for actor
   *
   * @param {Number} timestep - update timestep
   * @param {Object} env - environment variables defined by engine
   */
  update = (timestep, env) => {
    // ****************************************************************
    // perform default updates

    this.#last.pos = this.pos;
    this.#last.vel = this.vel;

    this.vel.x += env.physics.accel.x / timestep;
    this.vel.y += env.physics.accel.y / timestep;

    // ****************************************************************
    // call update callback function

    if (this.eventHandler.eventHandlers["on_update"])
      this.eventHandler.eventHandlers["on_update"](timestep, env);
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

  /**
   * An array of TextureLayers that can be drawn to the canvas in the draw callback.
   *
   * @private
   * @type {Array<TextureLayer>}
   */
  #textures = [];

  #drawDebug = (ctx) => {
    ctx.save();

    // draw bounds border
    ctx.strokeStyle = "red";
    ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

    ctx.fillStyle = "black";

    const texts = [
      `pos: ${this.pos.x}, ${this.pos.y}`,
      `vel: ${this.vel.x}, ${this.vel.y}`,
      `textures: ${this.#textures.length}`,
      `isClippedToSize: ${this.isClippedToSize}`,
    ];

    texts.forEach((text, i) => {
      ctx.fillText(text, this.pos.x, this.pos.y - 12 * (i + 0.5));
    });

    ctx.restore();
  };
}
