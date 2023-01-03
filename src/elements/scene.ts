import { vec } from "../math/vector";
import Actor from "./actor";
import Camera from "../core/camera";
import Engine from "../core/engine";

/**
 * @class Scene
 * A collection of actors and cameras.
 */
export default class Scene {
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  readonly engine: Engine;

  readonly name: string;

  camera: Camera;

  actors: Map<string, Actor> = new Map();

  /**
   * Whether or not the scene is queued to be removed from the engine at the
   * next tick.
   *
   * @default false
   */
  isQueuedForDisposal: boolean = false;

  isRenderEnabled: boolean = true;

  isTickEnabled: boolean = true;

  environment: SceneEnvironment = {
    background: "transparent",
    gravity: vec(0, 0)
  };

  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS (w getters)
  // ****************************************************************

  private readonly internalID: string;

  // ****************************************************************
  // ⚓ CONSTRUCTOR
  // ****************************************************************

  constructor(name: string, engine: Engine, camera: Camera, options: SceneOptions = {}) {
    this.name = name;
    this.internalID = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    this.engine = engine;

    this.camera = camera;

    this.environment = options.environment ?? this.environment;

    this.engine.scenes.set(this.internalID, this);
  }

  // ****************************************************************
  // ⚓ PUBLIC METHODS
  // ****************************************************************

  addListener = (eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)) => this.engine.eventHandler.addListener(eventName, callback);

  removeListener = (eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)) => this.engine.eventHandler.removeListener(eventName, callback);

  queueDisposal = () => {
    this.isQueuedForDisposal = true;
  }

  preload = () => {
    return Promise.all(Array.from(this.actors.values()).map(actor => actor.preload()));
  };

  tick = (targetFrameTimestep: number) => {
    if (!this.isTickEnabled || this.isQueuedForDisposal) return;

    Array.from(this.actors.values()).forEach(actor => actor.tick(targetFrameTimestep));
  }

  render = (interpolationFactor: number) => {
    if (!this.isRenderEnabled || this.isQueuedForDisposal) return;

    const ctx: CanvasRenderingContext2D = this.engine.ctx;

    ctx.fillStyle = this.environment.background;
    ctx.fillRect(0, 0, this.engine.canvasSize.x, this.engine.canvasSize.y);

    Array.from(this.actors.values()).forEach(actor => actor.render(interpolationFactor));
  }

  // ****************************************************************
  // ⚓ PRIVATE DECLARATION GETTERS & SETTERS
  // ****************************************************************

  get ID(): string {
    return this.internalID;
  }
}
