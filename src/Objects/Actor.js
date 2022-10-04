import { vec, add, sub, div, mult } from "../math/Vector";
import TextureLayer from "../util/TextureLayer";

import { assertIsVector } from "../util/Asserts";
import EventSubscriber from "../core/EventSubscriber";

/**
 * An actor that can be added to the engine and manipulated.
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
   * @param {Boolean} properties.isClippedToSize whether or not the actor will automatically clip draw calls to actor's size
   * @param {Boolean} properties.isDebugEnabled whether or not the actor will draw debug information
   */
  constructor(properties = {}) {
    super();

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

    this.isClippedToSize = properties.isClippedToSize ?? true;

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

    // split texture layers into those that render below main draw call and those that render above
    const activeTextureLayers = this.#textures.filter(
      (textureLayer) => textureLayer.isActive
    );

    // sort active texture layers by z-index
    activeTextureLayers.sort(
      (a, b) => a.drawProperties.zIndex - b.drawProperties.zIndex
    );

    // ****************************************************************
    // primary draw operations

    ctx.save();

    // if clipping is enabled then set context clip to actor bounds
    if (this.isClippedToSize) {
      ctx.beginPath();
      ctx.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
      ctx.clip();
    }

    // draw active texture layers
    activeTextureLayers.forEach((textureLayer) => {
      this.drawTextureLayer(textureLayer, ctx);
    });

    // call user-defined update callback function
    if (this.draw) this.draw(ctx, interp);

    // ****************************************************************
    // restore & debug operations

    // restore canvas context to previous state so we don't clip debug content
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

  getTextures = () => new Promise((resolve, reject) => resolve(this.#textures));

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
      `textures: ${this.#textures.length}`,
      `isClippedToSize: ${this.isClippedToSize}`,
    ];

    texts.forEach((text, i) => {
      ctx.fillText(text, this.pos.x, this.pos.y - 12 * (i + 0.5));
    });

    ctx.restore();
  };
}
