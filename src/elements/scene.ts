import { vec } from "../math/vector";
import Actor from "./actor";
import Camera from "../core/camera";
import Engine from "../core/engine";
import Element from "./element";

/**
 * @class Scene
 * A collection of actors and cameras.
 */
export default class Scene extends Element {

  camera: Camera;

  actors: Map<string, Actor> = new Map();

  environment: SceneEnvironment = {
    background: "transparent",
    gravity: vec(0, 0)
  };

  /**
   * Creates a new Scene instance.
   *
   * @param name name of scene
   * @param engine engine reference to attach scene to
   * @param camera camera to attach to scene
   * @param defaultProperties optional properties to assign at creation
   */
  constructor(name: string, engine: Engine, camera: Camera, defaultProperties: Partial<ElementDefaultProperties> & Partial<SceneEnvironment> = {}) {
    super(name, engine, defaultProperties);

    this.camera = camera;

    this.environment.background = defaultProperties?.background ?? this.environment.background;
    this.environment.gravity = defaultProperties?.gravity ?? this.environment.gravity;

    this.engine.scenes.set(this.ID, this);

    this.engine.debugger.baseSection.addSection(this.name, false)
      .addItem("background", () => this.environment.background)
      .addItem("Position", () => this.position)
      .addItem("Velocity", () => this.velocity)
  }

  override start = (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      this.preload()
        .then(() => {
          this.isPreloaded = true;
          resolve(Promise.all(Array.from(this.actors.values()).map(actor => actor.start())));
        })
        .catch(err => reject(err));
    });
  };

  override internalTick = (targetFrameTimestep: number) => {
    Array.from(this.actors.values()).forEach(actor => actor.tick(targetFrameTimestep));
  }

  override internalRender = (ctx: CanvasRenderingContext2D, interpolationFactor: number): void => {
    ctx.fillStyle = this.environment.background;
    ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);

    ctx.save();

    // clip the context to the scene size
    ctx.beginPath();
    ctx.rect(this.position.x, this.position.y, this.size.x, this.size.y);
    ctx.clip();

    ctx.scale(this.camera.zoom, this.camera.zoom);

    Array.from(this.actors.values()).forEach(actor => actor.render(interpolationFactor));

    ctx.restore();
  }
}
