import { vec } from "../math/vector";
import Engine from "./engine";
import { Scene } from "./scene";

/**
 * @class Camera
 * A camera that is used to render a scene onto the engine screen.
 *
 * @unused
 */
export class Camera {
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  readonly name: string;

  private readonly internalID: string;

  readonly engine: Engine;

  position: Vector = vec();

  rotation: Vector = vec();

  zoom: number = 1;

  // ****************************************************************
  // ⚓ CONSTRUCTOR
  // ****************************************************************
  constructor(name: string, engine: Engine, options: CameraOptions = {}) {
    this.name = name;
    this.internalID = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    this.engine = engine;

    this.position = options.position ?? this.position;
    this.rotation = options.rotation ?? this.rotation;
    this.zoom = options.zoom ?? this.zoom;
  }

  // ****************************************************************
  // ⚓ PUBLIC METHODS
  // ****************************************************************

  addListener(name: ValidEventType, callback: ((event: any) => void)): void {
    this.engine.eventHandler.addListener(name, callback);
  }

  removeListener(name: ValidEventType, callback: ((ev: ValidEventPayload) => void)): void {
    this.engine.eventHandler.removeListener(name, callback);
  }
}
