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

    this.engine.scenes.set(this.internalID, this);
  }

  // ****************************************************************
  // ⚓ PUBLIC METHODS
  // ****************************************************************

  dispose() {
    this.isQueuedForDisposal = true;
  }

  preload() {
    return Promise.all(Array.from(this.actors.values()).map(actor => actor.preload()));
  };

  update(targetFrameTimestep: number) {
    if (this.isQueuedForDisposal) {
      return;
    }
  }

  render(interpolationFactor: number) {
    const ctx = this.engine.ctx;
  }

  // ****************************************************************
  // ⚓ PRIVATE DECLARATION GETTERS & SETTERS
  // ****************************************************************

  get ID(): string {
    return this.internalID;
  }
}
