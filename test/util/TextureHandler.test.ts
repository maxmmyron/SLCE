import { describe, it, expect } from "vitest";
import "./imageBitmap.mock"
import TextureHandler from "@/util/TextureHandler";
import testImage from "./testTexture.png";

describe("TextureHandler", () => {
  it("is instantiable", () => {
    expect(new TextureHandler()).toBeInstanceOf(TextureHandler);
  });

  describe("registering a texture from path", () => {
    it("registers and returns an ImageBitmap", async () => {
      const textureHandler = new TextureHandler();

      const bitmap = await textureHandler.registerTextureFromPath("test", testImage);

      expect(textureHandler.getTextureCache().size).toBe(1);
      expect(bitmap).toBeInstanceOf(ImageBitmap);
    });

    it("does not register if it already exists in the cache", async () => {
      const textureHandler = new TextureHandler();
      await textureHandler.registerTextureFromPath("test", testImage);

      expect(async () => await textureHandler.registerTextureFromPath("test", testImage)).not.toThrow();
      await textureHandler.registerTextureFromPath("test", testImage);

      expect(textureHandler.getTextureCache().size).toBe(1);
      expect(textureHandler.getRegisteredTexture("test")).toBeInstanceOf(ImageBitmap);
    });
  });

  describe("registering a texture from bitmap", () => {
    it("registers and returns an ImageBitmap", async () => {
      const textureHandler = new TextureHandler();
      const imageBitmap = await createImageBitmap(new ImageData(32, 32));
      const registeredBitmap = textureHandler.registerTextureFromBitmap("test", imageBitmap);

      expect(textureHandler.getTextureCache().size).toBe(1);
      expect(registeredBitmap).toBeInstanceOf(ImageBitmap);
    });

    it("does not register if it already exists in the cache", async () => {
      const textureHandler = new TextureHandler();
      const ImageBitmap = await createImageBitmap(new ImageData(32, 32));
      textureHandler.registerTextureFromBitmap("test", ImageBitmap);

      expect(() => textureHandler.registerTextureFromBitmap("test", ImageBitmap)).not.toThrow();
      expect(textureHandler.getTextureCache().size).toBe(1);
      expect(textureHandler.getRegisteredTexture("test")).toBe(ImageBitmap);
    });
  });

  describe("unregistering a texture", () => {
    it("unregisters a texture from the cache", async () => {
      const textureHandler = new TextureHandler();
      await textureHandler.registerTextureFromPath("test", testImage);

      expect(textureHandler.getTextureCache().size).toBe(1);
      textureHandler.unregisterTexture("test");

      expect(textureHandler.getTextureCache().size).toBe(0);
    });

    it("does not unregister a texture if it does not exist in the cache", async () => {
      const textureHandler = new TextureHandler();
      await textureHandler.registerTextureFromPath("test", testImage);

      expect(() => textureHandler.unregisterTexture("test2")).not.toThrow();
      expect(textureHandler.getTextureCache().size).toBe(1);
    });
  });

  describe("retrieving a texture", () => {
    it("can retrieve a texture from the cache", async () => {
      const textureHandler = new TextureHandler();

      const texture = await textureHandler.registerTextureFromPath("test", testImage)

      expect(texture).toBeInstanceOf(ImageBitmap);

    });

    it("throws an error if the texture does not exist in the cache", async () => {
      const textureHandler = new TextureHandler();
      await textureHandler.registerTextureFromPath("test", testImage);

      expect(() => textureHandler.getRegisteredTexture("test2")).toThrow();
    });
  });
});
