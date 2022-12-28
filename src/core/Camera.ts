import { vec } from "../math/vector";
import Engine from "./engine";
import { Scene } from "./Scene";

/**
 * @class Camera
 * A camera that is used to render a scene onto the engine screen.
 */
export class Camera {
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  readonly ID: string;

  engine: Engine;

  position: Vector = vec();

  rotation: Vector = vec();

  zoom: number = 1;

  // ****************************************************************
  // ⚓ CONSTRUCTOR
  // ****************************************************************
  constructor(id: string, engine: Engine, options: CameraOptions = {}) {
    // Math.random().toString(36).substring(2, 9); or something
    this.ID = id;

    this.engine = engine;

    this.engine.camera = this;

    this.position = options.position ?? this.position;
    this.rotation = options.rotation ?? this.rotation;
    this.zoom = options.zoom ?? this.zoom;
  }


}
