import { vec } from "../math/vector";
import Actor from "../objects/actor";
import Engine from "./engine";

/**
 * @class Scene
 * A collection of actors and cameras.
 */
export class Scene {
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  readonly engine: Engine;

  readonly name: string;

  actors: Map<string, Actor> = new Map();

  isQueuedForDisposal: boolean = false;

  isRenderEnabled: boolean = true;

  isUpdateEnabled: boolean = true;

  environment: SceneEnvironment = {
    background: "#000000",
    gravity: vec(0, 0)
  };

  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS (w getters)
  // ****************************************************************

  private readonly internalID: string;

  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS (w/o getters)
  // ****************************************************************

  // ****************************************************************
  // ⚓ CONSTRUCTOR
  // ****************************************************************
  constructor(name: string, engine: Engine, options: SceneOptions = {}) {
    this.name = name;

    this.internalID = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    this.engine = engine;

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



    if (this.isQueuedForDisposal) {
      return;
    }
  }

  render = (interpolationFactor: number) => {
    const ctx = this.engine.ctx;

    ctx.fillStyle = this.environment.background;
    ctx.fillRect(0, 0, this.engine.canvasSize.x, this.engine.canvasSize.y);
  }

  // ****************************************************************
  // ⚓ PRIVATE DECLARATION GETTERS & SETTERS
  // ****************************************************************

  get ID(): string {
    return this.internalID;
  }
}
