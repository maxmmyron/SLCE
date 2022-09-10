import { vec } from "../Math/Vector";

/**
 * TextureLayer.js - A helper class that encapsulates a texture and its draw arguments for drawing to the canvas.
 */
export default class TextureLayer {
  /**
   * Constructs a new TextureLayer object.
   *
   * @param {String} texture - path to texture image file
   * @param {Object} initialProperties - opitonal arguments for texture layer
   * @property {Vector} initialProperties.pos - position of texture layer
   * @property {Vector} initialProperties.size - size of texture layer
   * @property {Number} initialProperties.zIndex - z-index of texture layer. -1 will draw texture behind actor.
   */
  constructor(path, properties = {}) {
    this.#path = path || null;

    // apply any options passed in; keep defaults if not provided
    this.properties = {
      pos: properties.pos ?? vec(),
      size: properties.size ?? vec(48),
      repeatX: properties.repeatX ?? false,
      repeatY: properties.repeatY ?? false,
      zIndex: properties.zIndex ?? 0,
    };
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
