import { vi } from "vitest";

Object.defineProperty(globalThis, "createImageBitmap", {
  value: vi.fn().mockImplementation((image: ImageData) => {
    return new Promise((resolve, reject) => {
      resolve(new ImageBitmap());
    });
  }),
});

Object.defineProperty(globalThis, "ImageBitmap", {
  value: class ImageBitmap {
    constructor() { }
    close() { }
  }
});

Object.defineProperty(globalThis, "Image", {
  value: class Image {
    onload = () => { };
    constructor() {
      setTimeout(() => {
        this.onload();
      }, 100);
    }
  }
});
