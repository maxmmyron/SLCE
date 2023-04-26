import Engine from "@/core/Engine";

export const createMockEngine = (options: EngineOptions = {}): Engineable => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  return new Engine(document.createElement("canvas"), options);
}
