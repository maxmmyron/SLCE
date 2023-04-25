import Engine from "@/core/Engine";

export const createMockEngine = (): Engineable => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  return new Engine(document.createElement("canvas"));
}
