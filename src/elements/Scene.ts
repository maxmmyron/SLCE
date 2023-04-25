import Vector2D from "@/math/Vector2D";
import Element from "./Element";

/**
 * @class Scene
 * A collection of actors and cameras.
 */
export default class Scene extends Element {

  camera: Camerable;

  actors: Map<string, Actorable> = new Map();

  environment: SceneEnvironment = {
    background: "transparent",
    gravity: new Vector2D()
  };

  /**
   * Creates a new Scene instance.
   *
   * @param name name of scene
   * @param engine engine reference to attach scene to
   * @param camera camera to attach to scene
   * @param options optional properties to assign at creation
   */
  constructor(name: string, engine: Engineable, camera: Camerable, options: SceneOptions = {}) {
    super(name, engine, options);

    this.camera = camera;

    this.environment.background = options?.background ?? this.environment.background;
    this.environment.gravity = options?.gravity ?? this.environment.gravity;

    this.engine.scenes.set(this.ID, this);

    this.engine.parameterGUI.baseSection.addSubsection(this.name, false)
      .addParameter("background", () => this.environment.background)
      .addParameter("Position", () => this.position)
      .addParameter("Velocity", () => this.velocity)
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
    ctx.fillRect(this.position.x, this.position.y, this.scale.x, this.scale.y);

    ctx.save();

    ctx.beginPath();
    ctx.rect(this.position.x, this.position.y, this.scale.x, this.scale.y);
    ctx.clip();

    ctx.scale(this.camera.zoom, this.camera.zoom);

    Array.from(this.actors.values()).forEach(actor => actor.render(interpolationFactor));
    ctx.restore();
  }
}
