/**
 * TextureLayer.js - A helper class that encapsulates a texture and its draw arguments for drawing to the canvas.
 * 
 */
export default class TextureLayer {
  /**
   * Constructs a new TextureLayer object.
   * 
   * @param {String} texture - path to texture image file
   * @param {Object} options - opitonal arguments for texture layer
   */
  constructor(path, options = {}) {

    this.#path = path;

    this.options = options;

    // init TextureLayer
    this.#init();
  }

  // ****************************************************************
  // Public defs

  /**
   * ImageBitmap for texturing
   * 
   * @type {ImageBitmap}
   */
  imageBitmap = null;

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
  options = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
  };

  // ****************************************************************
  // Private defs

  /**
   * Path to texture image file
   * 
   * @private
   * @type {String}
   */
  #path = null;

  /**
   * Initializes texture layer
   * 
   * @private
   */
  #init = () => {
    const image = new Image();
    image.src = this.#path;
    image.crossOrigin = "anonymous";

    image.onload = () => {
      createImageBitmap(image)
        .then(imageBitmap => this.imageBitmap = imageBitmap)
        // throw an error if ImageBitmap cannot be instantiated
        .catch(err => {
          throw new Error(`Error creating image bitmap: ${err}`)
        });
    }

    // throw an error if image does not load properly
    image.onerror = (err) => {
      throw new Error(`Error initializing texture layer: ${err}`);
    }
  }
}