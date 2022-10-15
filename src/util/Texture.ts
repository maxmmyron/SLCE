/**
 * Resolves a new ImageBitmap from a Promise that accepts an image file path.
 *
 * @param {string} path path to image file
 *
 * @returns {Promise<ImageBitmap>} resolves an image bitmap from an image file path
 *
 * @throws Error if path is not provided
 */
export const resolveImageBitmap = (path: string): Promise<ImageBitmap> => {
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
