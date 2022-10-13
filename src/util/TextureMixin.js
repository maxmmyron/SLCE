import { vec } from "../math/Vector";
import { assertIsVector } from "./Asserts";

/**
 * Mixin helper for Actor function that provides useful texture functionality.
 *
 * @namespace TextureMixin
 */
export const textureMixin = {
  /**
   * An array of texture objects, assigned by textureID keys.
   *
   * @type {Object}
   * @default {}
   */
  textures: {},

  /**
   * The current texture ID to draw for the actor.
   * Overridden by AnimationID if animation is active.
   *
   * @type {String}
   * @default null
   */
  textureID: null,

  /**
   * The offset to start drawing the texture from the top left corner of the actor.
   *
   * @type {Vector}
   * @default vec()
   */
  textureOffset: vec(),

  /**
   * Loads a texture from path and assigns it and associated texturing properties to the actor.
   *
   * @param {String} textureID identifier to assign to texture. Must be unique.
   * @param {String} path path to texture image file
   * @param {Object} options (optional) options for texture
   * @param {Number} options.frameCount (optional) number of sprite frames in texture
   * @param {Vector} options.spriteSize size of individual sprite frames. If frameCount is provided this property is required.
   *
   * @returns true if texture was successfully added to actor
   *
   * @throws Error if path is not provided
   * @throws Error if textureID is not unique
   * @throws Error if spriteSize provided is not a positive Vector
   * @throws Error if imageBitmap Promise is rejected
   */
  loadTexture: async (textureID, path, options) => {
    // assert path is a valid path
    if (!path) throw new Error(`Error loading texture: Path not provided`);

    // assert textureID is not already in use
    if (this.textures[textureID])
      throw new Error(`Error loading texture: Name not provided`);

    // extract options
    const { spriteSize = null, frameCount = 1 } = options;

    if (spriteSize !== null) {
      assertIsVector(spriteSize);
      if (spriteSize.x <= 0 || spriteSize.y <= 0)
        throw new Error(`Error loading texture: spriteSize must be positive`);
    }

    await resolveImageBitmap(path)
      .then((imageBitmap) => {
        this.textures[textureID] = {
          imageBitmap,
          spriteSize,
          frameCount,
        };
      })
      .catch((err) => {
        throw new Error(`Error loading texture: ${err}`);
      });

    return true;
  },

  /**
   * Unloads a texture from the textures array.
   *
   * @param {String} textureID identifier of texture to remove
   *
   * @returns true if texture was successfully removed
   *
   * @throws Error if textureID is not found within the textures array
   */
  unloadTexture: (textureID) => {
    // assert textureID is in use
    if (!textures[textureID])
      throw new Error(`Error unloading texture: Texture not found`);

    delete textures[textureID];

    return true;
  },
};

/**
 * Resolves a new ImageBitmap from a Promise that accepts an image file path.
 *
 * @param {String} path path to image file
 *
 * @returns {Promise<ImageBitmap>} resolves an image bitmap from an image file path
 *
 * @throws Error if path is not provided
 */
const resolveImageBitmap = (path) => {
  return new Promise((resolve, reject) => {
    if (!path) return reject(new Error("No path provided"));

    const image = new Image();
    image.src = path;
    image.crossOrigin = "anonymous";

    image.onload = () => {
      createImageBitmap(image)
        .then((imageBitmap) => {
          resolve(imageBitmap);
        })
        .catch((err) => reject(err));
    };

    image.onerror = (err) => reject(err);
  });
};
