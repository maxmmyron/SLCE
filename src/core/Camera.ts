import { vec } from "../math/vector";
import Engine from "./engine";

/**
 * @class Camera
 * A camera that is used to render a scene onto the engine screen.
 *
 * @unused
 */
export default class Camera {

  readonly name: string;

  private readonly internalID: string;

  readonly engine: Engine;

  position: Vector = vec();

  velocity: Vector = vec();

  rotation: Vector = vec();

  zoom: number = 1;

  /**
   * Creates a new camera instance.
   * @param name unique name of camera
   * @param engine engine to assign to camera
   * @param defaultProperties optional properties to assign at creation
   */
  constructor(name: string, engine: Engine, defaultProperties: Partial<DefaultCameraProperties> = {}) {
    this.name = name;
    this.internalID = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    this.engine = engine;

    defaultProperties.position && (this.position = defaultProperties.position);
    defaultProperties.rotation && (this.rotation = defaultProperties.rotation);
    defaultProperties.zoom && (this.zoom = defaultProperties.zoom);

    this.engine.debugger.baseSection.addSection(this.name, false)
      .addItem("Position", () => this.position)
      .addItem("Velocity", () => this.velocity)
      .addItem("Zoom", () => this.zoom);

  }

  addListener(name: ValidEventType, callback: ((event: any) => void)): void {
    this.engine.eventHandler.addListener(name, callback);
  }

  removeListener(name: ValidEventType, callback: ((ev: ValidEventPayload) => void)): void {
    this.engine.eventHandler.removeListener(name, callback);
  }
}
