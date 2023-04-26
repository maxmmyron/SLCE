import Camera from "@/core/Camera";
import Engine from "@/core/Engine";
import Scene from "@/elements/Scene";
import Actor from "@/elements/Actor";

/**
 * Creates a new instance of an engine with an attached camera, scene, and actor.
 * @param options optional arguments to pass to the engine
 * @returns
 */
export const createMockEngineInstance = (options: EngineOptions = {}): {engine: Engine, camera: Camera, scene: Scene, actor: Actor} => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  const canvas = document.createElement("canvas");

  const engine = new Engine(canvas, options);
  engine.start = async (): Promise<void> => {
    if(engine.isStarted) throw new Error();
    await Promise.all(Array.from(engine.scenes.values()).map((scene) => scene.start()));
    engine.isStarted = true;
  };
  const camera = new Camera("testCamera", engine);
  const scene = new Scene("testScene", engine, camera);
  const actor = new Actor("testActor", scene);

  return { engine, camera, scene, actor };
}
