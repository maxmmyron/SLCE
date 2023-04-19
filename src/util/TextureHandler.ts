export default class TextureHandler implements TextureHandlerable {
  private textureCache: Map<string, ImageBitmap> = new Map();

  constructor() {}

  registerTextureFromPath(name: string, texturePath: string): Promise<ImageBitmap> {
    const image = new Image();

    image.src = texturePath;
    image.crossOrigin = "anonymous";

    return new Promise((resolve, reject) => {
      image.onload = () => {
        createImageBitmap(image)
          .then((imageBitmap: ImageBitmap) => {
            this.textureCache.set(name, imageBitmap);
            resolve(imageBitmap);
          })
          .catch((error: Error) => { reject(`Error loading image from path`); });
      };

      image.onerror = () => { reject(`Error loading image from path`); }
    });
  }

  registerTextureFromBitmap(name: string, texture: ImageBitmap): ImageBitmap {
    throw new Error("Method not implemented.");
  }

  unregisterTexture(name: string): void {
    throw new Error("Method not implemented.");
  }
  getRegisteredTexture(name: string): ImageBitmap {
    throw new Error("Method not implemented.");
  }
  getTextureCache(): Map<string, ImageBitmap> {
    return this.textureCache;
  }

}
