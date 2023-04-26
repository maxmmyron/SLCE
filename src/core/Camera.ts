import Vector2D from "@/math/Vector2D";

/**
 * @class Camera
 * A camera that is used to render a scene onto the engine screen.
 *
 * @unused
 */
export default class Camera implements Camerable {

  readonly name: string;
  readonly engine: Engineable;

  position: Vector2D;
  velocity: Vector2D = new Vector2D();
  rotation: Vector2D;
  zoom: number;

  private readonly internalID: string;

  /**
   * Creates a new camera instance.
   * @param name unique name of camera
   * @param engine engine to assign to camera
   * @param options optional properties to assign at creation
   */
  constructor(name: string, engine: Engineable, options: CameraOptions = {}) {
    this.name = name;
    this.internalID = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    this.engine = engine;

    this.position = options.position ?? new Vector2D();
    this.rotation = options.rotation ?? new Vector2D();
    this.zoom = options.zoom ?? 1;

    this.engine.parameterGUI.baseSection.addSubsection(this.name, false)
      .addParameter("Position", () => this.position)
      .addParameter("Velocity", () => this.velocity)
      .addParameter("Zoom", () => this.zoom);

  }

  registerEventCallback = <Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void => {
    this.engine.eventHandler.registerEventCallback(type, callback);
  };

  unregisterEventCallback = <Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void => {
    this.engine.eventHandler.unregisterEventCallback(type, callback);
  };
}
