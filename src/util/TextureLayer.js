import { vec } from "../Math/Vector";

/**
 * TextureLayer.js - A helper class that encapsulates a texture and its draw arguments for drawing to the canvas.
 */
export default class TextureLayer {
  /**
   * Constructs a new TextureLayer object.
   *
   * @param {String} path - path to texture image file
   * @param {Object} options - options for drawing texture
   */
  constructor(path, options = {}) {
    this.#path = path || null;

    // apply any options passed in; keep defaults if not provided
    this.drawProperties = {
      repeatX: options.repeatX ?? false,
      repeatY: options.repeatY ?? false,
      zIndex: options.zIndex ?? 0,
    };

    this.pos = options.pos ?? vec();
    this.size = options.size ?? vec(48, 48);

    this.isActive = options.isActive ?? true;
  }

  // ****************************************************************
  // Public defs

  /**
   * ImageBitmap of texture layer
   *
   * @type {ImageBitmap}
   */
  imageBitmap;

  /**
   * Current position of texture layer, relative to parent actor's position.
   *
   * @type {Vector}
   * @default vec()
   */
  pos;

  /**
   * Size of texture layer.
   *
   * @type {Vector}
   * @default vec(48)
   */
  size;

  /**
   * Whether or not texture layer is active. If false, texture layer will not be drawn.
   *
   * @type {Boolean}
   * @default true
   */
  isActive;

  /**
   * resolves an image bitmap from an image file path
   */
  resolveImageBitmap = () => {
    return new Promise((resolve, reject) => {
      if (!this.#path) return reject(new Error("No path provided"));

      const image = new Image();
      image.src = this.#path;
      image.crossOrigin = "anonymous";

      image.onload = () => {
        // create image bitmap from image file
        createImageBitmap(image)
          .then((imageBitmap) => {
            this.imageBitmap = imageBitmap;
            resolve(imageBitmap);
          })
          .catch((err) => reject(err));
      };

      image.onerror = (err) => reject(err);
    });
  };

  // ****************************************************************
  // Private defs

  /**
   * Path to texture image file
   *
   * @private
   * @type {String}
   */
  #path;
}
