import { vec } from "../math/vector";

/**
 * @class Camera
 * A camera that is used to render a scene onto the engine screen.
 */
export class Camera {
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  readonly ID: string;

  position: Vector = vec();

  rotation: Vector = vec();

  zoom: number = 1;

  // ****************************************************************
  // ⚓ CONSTRUCTOR
  // ****************************************************************
  constructor(position?: Vector, rotation?: Vector, zoom?: number) {
    this.ID = "a"; // Math.random().toString(36).substring(2, 9); or something

    this.position = position || this.position;

    this.rotation = rotation || this.rotation;

    this.zoom = zoom || this.zoom;
  }


}
