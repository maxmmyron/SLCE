import { vec } from "../Math/Vector";

/**
 * TextureLayer.js - A helper class that encapsulates a texture and its draw arguments for drawing to the canvas.
 */
export default class TextureLayer {
  /**
   * Constructs a new TextureLayer object.
   * 
   * @param {String} texture - path to texture image file
   * @param {Object} options - opitonal arguments for texture layer
   */
  constructor(path, options = {}) {

    this.#path = path || null;

    // apply any options passed in; keep defaults if not provided
    this.options = {
      pos: options.pos ?? vec(),
      size: options.size ?? vec(),
      vel: options.vel ?? vec(),
      rotation: options.rotation ?? 0,
      opacity: options.opacity ?? 1,
      zIndex: options.zIndex ?? 0,
    };
  }

  // ****************************************************************
  // Public defs

  /**
   * optional arguments for drawing texture layer
   * 
   * @type {Object} options
   * @property {Number} options.x - starting x position of texture layer (with respect to x pos of actor)
   * @property {Number} options.y - starting y position of texture layer (with respect to y pos of actor)
   * @property {Number} options.width - width of texture layer
   * @property {Number} options.height - height of texture layer
   * @property {Number} options.rotation - rotation of texture layer
   * @property {Number} options.opacity - opacity of texture layer
   * @property {Number} options.zIndex - z-index of texture layer. -1 will draw texture behind actor.
   */
  options;

  // ****************************************************************
  // Private defs

  /**
   * Path to texture image file
   * 
   * @private
   * @type {String}
   */
  #path;

  /**
   * resolves an image bitmap from an image file path
   */
  resolveImageBitmap = () => new Promise((resolve, reject) => {
    if (!this.#path)
      return reject(new Error("No path provided"));

    const image = new Image();
    image.src = this.#path;
    image.crossOrigin = "anonymous";

    image.onload = () => {
      // create image bitmap from image file
      createImageBitmap(image)
        .then(imageBitmap => resolve(imageBitmap))
        .catch(err => reject(err));
    };

    image.onerror = (err) => reject(err);
  });
}