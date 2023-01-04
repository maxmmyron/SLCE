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
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  camera: Camera;

  actors: Map<string, Actor> = new Map();

  environment: SceneEnvironment = {
    background: "transparent",
    gravity: vec(0, 0)
  };

  // ****************************************************************
  // ⚓ CONSTRUCTOR
  // ****************************************************************

  /**
   * Creates a new Scene instance.
   *
   * @param name name of scene
   * @param engine engine reference to attach scene to
   * @param camera camera to attach to scene
   * @param properties scene properties
   * @param environment scene environment
   */
  constructor(name: string, engine: Engine, camera: Camera, properties?: ElementProperties, environment?: SceneEnvironment) {
    super(name, engine, properties);

    this.camera = camera;

    this.environment.background = environment?.background ?? this.environment.background;
    this.environment.gravity = environment?.gravity ?? this.environment.gravity;

    this.engine.scenes.set(this.ID, this);
  }

  // ****************************************************************
  // ⚓ PUBLIC METHODS
  // ****************************************************************

  override preload = () => {
    return Promise.all(Array.from(this.actors.values()).map(actor => actor.preload()));
  };


  override internalTick = (targetFrameTimestep: number) => {
    Array.from(this.actors.values()).forEach(actor => actor.tick(targetFrameTimestep));
  }


  override internalRender = (ctx: CanvasRenderingContext2D, interpolationFactor: number): void => {
    ctx.fillStyle = this.environment.background;
    ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);

    Array.from(this.actors.values()).forEach(actor => actor.render(interpolationFactor));
  }
}
