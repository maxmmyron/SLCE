import Vector2D from "../math/vector2d";

/**
 * @class Camera
 * A camera that is used to render a scene onto the engine screen.
 *
 * @unused
 */
export default class Camera implements Camerable {

  readonly name: string;

  private readonly internalID: string;

  readonly engine: Engineable;

  position: Vector2D = new Vector2D();

  velocity: Vector2D = new Vector2D();

  rotation: Vector2D = new Vector2D();

  zoom: number = 1;

  /**
   * Creates a new camera instance.
   * @param name unique name of camera
   * @param engine engine to assign to camera
   * @param defaultProperties optional properties to assign at creation
   */
  constructor(name: string, engine: Engineable, defaultProperties: Partial<DefaultCameraProperties> = {}) {
    this.name = name;
    this.internalID = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    this.engine = engine;

    defaultProperties.position && (this.position = defaultProperties.position);
    defaultProperties.rotation && (this.rotation = defaultProperties.rotation);
    defaultProperties.zoom && (this.zoom = defaultProperties.zoom);

    this.engine.parameterGUI.baseSection.addSubsection(this.name, false)
      .addParameter("Position", () => this.position)
      .addParameter("Velocity", () => this.velocity)
      .addParameter("Zoom", () => this.zoom);

  }

  addListener(name: ValidEventType, callback: ((event: any) => void)): void {
    this.engine.eventHandler.addListener(name, callback);
  }

  removeListener(name: ValidEventType, callback: ((ev: ValidEventPayload) => void)): void {
    this.engine.eventHandler.removeListener(name, callback);
  }
}
