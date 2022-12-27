interface TextureLoader {
  load(path: string): Promise<ImageBitmap>;
}
