import { vec, add, sub, div } from "../Math/Vector";
import TextureLayer from "../util/TextureLayer";
import EventHandler from "../util/EventHandler";

/**
 * An actor function represents an actor that can be placed within the canvas.
 * @param {Function} draw a draw function that is called every frame
 * @param {Function} update an update function that is called every frame
 * @param {Object} options optional arguments for velocity and position
 */
export default class Actor {
  constructor(options = {}) {

    // set velocity and position to values passed in options;
    // if not provided, set to 0
    this.vel = options.vel ?? vec();
    this.pos = options.pos ?? vec();

    this.eventHandler = new EventHandler(["preload", "draw", "update"]);
  }

  // ****************************************************************
  // Pubic defs

  /**
    * An EventHandler object for handling engine events
    * 
    * @private
    * @type {EventHandler}
    */
  eventHandler;

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
   * 
   * @param {TextureLayer} textureLayer 
   */
  addTextureLayer = (textureLayer) => new Promise((resolve, reject) => {
    console.log('attempting to add texture layer');
    textureLayer.resolveImageBitmap().then(imageBitmap => {
      this.textures.push(textureLayer);
      console.log('added texture layer');
      console.log(this.textures);
      resolve("Successfully resolved imageBitmap and added textureLayer to actor");
    }).catch(err => {
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
  preload = (preloadCallback, postloadCallback) => new Promise((resolve, reject) => {
    resolve(preloadCallback())
  }).then(() => {
    postloadCallback();
  }).catch(err => {
    reject(`Error in preload function: ${err}`);
  });

  /**
   * Calls draw callback function for actor.
   * @param {CanvasRenderingContext2D} ctx - canvas context to draw to
   */
  draw = (ctx) => {
    const negTextureLayers = this.textures.filter(textureLayer => textureLayer.options.zIndex < 0);
    const posTextureLayers = this.textures.filter(textureLayer => textureLayer.options.zIndex >= 0);

    // draw texture layers with a z-index below 0
    if (negTextureLayers.length > 0) {
      this.#drawTextureLayers(ctx, negTextureLayers);
    }


    // call draw callback function
    this.eventHandler.eventHandlers["draw"][0](ctx);

    // draw texture layers with a z-index geater than 0
    if (posTextureLayers.length > 0) {
      this.#drawTextureLayers(ctx, posTextureLayers);
    }
  }

  /**
   * Calls update callback function for actor
   * @param {Number} dt - update delta time
   * @param {Object} env - environment variables defined by engine
   */
  update = (dt, env) => {
    this.vel.x += env.physics.accel.x / dt;
    this.vel.y += env.physics.accel.y / dt;

    this.eventHandler.eventHandlers["update"][0](dt, env);
  }

  // ****************************************************************
  // Private defs

  #drawTextureLayers = (ctx, textureLayers) => {
    textureLayers.forEach(textureLayer => {
      const offsetPos = sub(this.pos, div(textureLayer.options.size, 2));
      ctx.drawImage(textureLayer.imageBitmap, offsetPos.x, offsetPos.y, textureLayer.options.size.x, textureLayer.options.size.y);
    });
  }
}