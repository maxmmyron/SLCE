import { vec } from "../Math/Vector";
import TextureLayer from "../util/TextureLayer";

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
    this.vel = options.vel ?? vec();
    this.pos = options.pos ?? vec();

    this.textures = options.textures ?? [];

    this.last.pos = this.pos;
    this.last.vel = this.vel;
  }

  // ****************************************************************
  // Pubic defs

  /**
   * optional arguments for drawing actor
   *
   * @type {Object} options
   * @property {Vector} options.pos - starting position of actor (with respect to origin of canvas)
   * @property {Vector} options.size - size of actor
   * @property {Vector} options.vel - velocity of actor
   * @property {Number} options.rotation - rotation of actor
   * @property {Number} options.opacity - opacity of actor
   * @property {Number} options.zIndex - z-index of actor. -1 will draw actor behind canvas.
   */
  options = {
    pos: vec(),
    size: vec(), // unimplemented
    vel: vec(),
    rotation: 0, // unimplemented
    opacity: 1, // unimplemented
    zIndex: 0, // unimplemented
    textures: [],
  };

  /**
   * An array of TextureLayer objects that are incrementally drawn to the canvas for each draw cycle.
   *
   * @type {Array<TextureLayer>}
   */
  textures = [];

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

    // draw texture layers with a z-index below 0
    this.#drawTextureLayers(
      ctx,
      this.textures.filter((texture) => texture.options.zIndex < 0)
    );

    // call draw callback function
    this.#drawCallback(ctx, interp);

    // draw texture layers with a z-index geater than 0
    this.#drawTextureLayers(
      ctx,
      this.textures.filter((texture) => texture.options.zIndex >= 0)
    );
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

  /**
   * Draws relevant texture layers to canvas.
   * @private
   *
   * @param {CanvasRenderingContext2D} ctx - canvas context to draw to
   * @param {Array<TextureLayer>} textureLayers - array of texture layers to draw
   */
  #drawTextureLayers = (ctx, textureLayers) => {
    // sort texture layers by z-index defined in options
    textureLayers.sort((a, b) => a.options.zIndex - b.options.zIndex);

    for (let textureLayer of textureLayers) {
      this.#drawTextureLayer(ctx, textureLayer);
    }
  };

  /**
   * Draws a single texture layer to canvas.
   * @private
   *
   * @param {CanvasRenderingContext2D} ctx - canvas context to draw to
   * @param {TextureLayer} textureLayer - texture layer to draw
   */

  #drawTextureLayer = (ctx, textureLayer) => {
    ctx.drawImage(
      textureLayer.imageBitmap,
      textureLayer.options.x,
      textureLayer.options.y
    );
    console.log("a");
  };
}
