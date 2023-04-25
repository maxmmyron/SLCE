import Vector2D from "@/math/Vector2D";

type ElementState = {
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  scale: Vector2D;
};

/**
 * The base class for all engine elements.
 */
export default class Element {
  readonly name: string;

  readonly engine: Engineable;

  isQueuedForDisposal: boolean = false;

  isRenderEnabled: boolean = true;

  isTickEnabled: boolean = true;

  /**
   * Whether or not the actor will draw debug information.
   *
   * @default false
   */
  isDebugEnabled: boolean = false;

  position: Vector2D = new Vector2D();

  velocity: Vector2D = new Vector2D();

  /**
   * The element rotation in radians.
   */
  rotation: number = 0;

  scale: Vector2D = new Vector2D();

  protected isPreloaded: boolean = false;

  /**
   * Whether or not interpolation should be factored in when calculating the
   * position of the actor. This is disabled for one frame when the actor is
   * moved using SetPosition()
   */
  protected isInterpolationEnabled: boolean = true;

  /**
 * A struct containing previous state of the actor.
 */
  protected previousState: ElementState;

  private readonly internalID: string;

  /**
   * Creates a new Element instance.
   *
   * @param name name of element.
   * @param scene engine reference
   * @param options Element properties to apply on startup
   */
  constructor(name: string, engine: Engineable, options: ElementOptions = {}) {
    this.name = name;
    this.internalID = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    this.engine = engine;

    options.position && (this.position = options.position);
    options.velocity && (this.velocity = options.velocity);
    options.rotation && (this.rotation = options.rotation);
    options.scale && (this.scale = options.scale);
    options.isDebugEnabled && (this.isDebugEnabled = options.isDebugEnabled);

    this.previousState = this.createLastState();
  }

  registerEventCallback = <Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void => {
    this.engine.eventHandler.registerEventCallback(type, callback);
  };

  unregisterEventCallback = <Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void => {
    this.engine.eventHandler.unregisterEventCallback(type, callback);
  };

  start = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.preload()
        .then(() => {
          this.isPreloaded = true;
          this.engine.preloadedActorCount++;
          resolve(true);
        })
        .catch((err) => reject(err));
    });
  };

  /**
   * Called once before the first frame cycle. Accepts a generic promise to
   * allow for asynchronous loading of textures.
   *
   * @returns {Promise<any>}
   */
  preload: () => Promise<any> = async () => { };

  /**
   * Performs common tick logic for all elements
   *
   * @param frameTimestep the time between the current and previous frame
   */
  tick = (frameTimestep: number): void => {
    if (!this.isTickEnabled || this.isQueuedForDisposal) return;

    // TODO: implement precision threshold
    if (Math.abs(this.position.x) < Number.EPSILON) this.position.x = 0;
    if (Math.abs(this.position.y) < Number.EPSILON) this.position.y = 0;
    if (Math.abs(this.velocity.x) < Number.EPSILON) this.velocity.x = 0;
    if (Math.abs(this.velocity.y) < Number.EPSILON) this.velocity.y = 0;

    this.previousState = this.createLastState();

    this.internalTick(frameTimestep);
  };

  protected internalTick = (frameTimestep: number): void => { };

  /**
   * Performs common rendering logic
   *
   * @param interpolationFactor interpolated time between current delta and target timestep
   */
  render = (interpolationFactor: number): void => {
    if (!this.isRenderEnabled || this.isQueuedForDisposal) return;
    let ctx = this.engine.ctx;

    if (this.isInterpolationEnabled) this.position = this.previousState.position
      .add(this.position.subtract(this.previousState.position).multiply(interpolationFactor));

    this.previousState.position = this.previousState.position.add(this.position.subtract(this.previousState.position).multiply(interpolationFactor));
    this.isInterpolationEnabled = true;

    ctx.save();
    this.internalRender(ctx, interpolationFactor);
    ctx.restore();
  };

  protected internalRender = (ctx: CanvasRenderingContext2D, interpolationFactor: number): void => { };

  /**
   * Immediately moves the actor to the specified position. Disables
   * interpolation for the next frame.
   *
   * @param pos position to move actor to
   */
  setPosition = (pos: Vector2D): void => {
    this.position = pos;
    this.isInterpolationEnabled = false;
  }

  protected createLastState = (): ElementState => {
    return {
      position: this.position,
      velocity: this.velocity,
      rotation: this.rotation,
      scale: this.scale,
    };
  };

  get ID(): string { return this.internalID; }
}
