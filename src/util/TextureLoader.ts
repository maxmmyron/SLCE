export const TextureLoader = (() => {
  let instance: Loader = null;

  const Loader = (): Loader => {
    /**
     * A cache containing objects consisting of a path and an ImageBitmap
     */
    let cache: Array<{ path: string, texture: ImageBitmap }> = [];

    /**
     * Adds a texture to the cache, assuming that the texture is not already in the cache.
     *
     * @param {string} path The path of the texture
     * @param {ImageBitmap} texture The texture to add to the cache
     *
     * @returns {number} length of the cache after adding the texture
     */
    const addToCache = (path: string, texture: ImageBitmap): number => cache.push({ path, texture });

    /**
     * Searches the cache for a texture.
     *
     * @param {string} path the path of the texture to search for
     *
     * @returns {Texture} the texture if found, undefined if not
     */
    const searchCache = (path: string): ImageBitmap | undefined => cache.find((texture) => texture.path === path)?.texture; // use optional chaining since .find() may return undefined

    /**
     * Loads a texture. If the texture is already cached, it will be returned from the cache.
     * Otherwise, it will be loaded from the provided path.
     *
     * @param path the path to the texture to load
     *
     * @returns {Texture} the texture loaded from the path or cache
     */
    const load = async (path: string): Promise<ImageBitmap> => {
      const cachedTexture: ImageBitmap = searchCache(path);

      return new Promise((resolve, reject) => {
        if(cachedTexture) resolve(cachedTexture);
        else {
          const image = new Image();

          image.src = path;
          image.crossOrigin = "anonymous";

          image.onload = () => {
            createImageBitmap(image).then((imageBitmap: ImageBitmap) => {
              addToCache(path, imageBitmap);
              resolve(imageBitmap);
            }).catch((error: Error) => {
              reject(error);
            });
          };

          image.onerror = () => {
            reject();
          };
        }
      });
    };

    return {
      load: load
    }
  };

  const getInstance = (): Loader => instance || (instance = Loader());

  return {
    getInstance: getInstance
  }
})();
