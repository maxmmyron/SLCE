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
          .catch((error: Error) => { reject(error); });
      };

      image.onerror = (error) => reject(error);
    });
  }

  registerTextureFromBitmap(name: string, texture: ImageBitmap): ImageBitmap {
    if(this.textureCache.has(name)) {
      return this.getRegisteredTexture(name);
    }

    this.textureCache.set(name, texture);
    return texture;
  }

  unregisterTexture(name: string): void {
    if(!this.textureCache.has(name)) return;

    this.textureCache.get(name)?.close();
    this.textureCache.delete(name);
  }
  getRegisteredTexture(name: string): ImageBitmap {
    if(!this.textureCache.has(name)) {
      throw new Error(`Texture ${name} not found in cache`);
    }
    return this.textureCache.get(name) as ImageBitmap;
  }
  getTextureCache(): Map<string, ImageBitmap> {
    return this.textureCache;
  }

}
