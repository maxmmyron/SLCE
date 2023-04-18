export default class TextureHandler implements TextureHandlerable {
  async registerTextureFromPath(name: string, texturePath: string): Promise<ImageBitmap> {
    throw new Error("Method not implemented.");
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
    throw new Error("Method not implemented.");
  }

}
