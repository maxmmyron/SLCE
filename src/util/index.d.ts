interface Loader {
  load(path: string): Promise<ImageBitmap>;
}
