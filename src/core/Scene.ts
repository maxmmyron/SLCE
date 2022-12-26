import Actor from "../objects/actor";
import { Camera } from "./Camera";
import Engine from "./engine";

/**
 * @class Scene
 * A collection of actors and cameras.
 */
export class Scene {
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  readonly ID: string;

  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS (w getters)
  // ****************************************************************

  private _actors: Array<Actor>;

  private _camera: Camera;

  // ****************************************************************
  // ⚓ CONSTRUCTOR
  // ****************************************************************
  constructor(engine: Engine, camera: Camera, actors: Array<Actor> = []) {
    this.ID = Math.random().toString(36).substring(2, 9); // improve

    this._camera = camera;

    this._actors = actors;
  }

  // ****************************************************************
  // ⚓ PUBLIC METHODS
  // ****************************************************************

  addActors(actors: Array<Actor>) {
    this._actors.push(...actors);
  }

  removeActors(actors: Array<Actor>): void {
    this._actors
      .filter(actor => actors.includes(actor))
      .forEach(actor => actor.isQueuedForDisposal = true);
  }

  update() { }

  render() { }

  // ****************************************************************
  // ⚓ PRIVATE DECLARATION GETTERS & SETTERS
  // ****************************************************************

  get camera(): Camera {
    return this._camera;
  }

  set camera(camera: Camera) {
    this._camera = camera;
  }

  get actors(): Array<Actor> {
    return this._actors;
  }
}
