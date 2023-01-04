import { createTextChangeRange } from "typescript";
import Engine from "../core/engine";
import { add, mult, sub, vec } from "../math/vector";

/**
 * The base class for all engine elements.
 */
export default class Element {
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  readonly name: string;

  readonly engine: Engine;

  isQueuedForDisposal: boolean = false;

  isRenderEnabled: boolean = true;

  isTickEnabled: boolean = true;

  position: Vector = vec();

  velocity: Vector = vec();

  rotation: Vector = vec();

  size: Vector = vec();

  /**
   * Whether or not the actor will draw debug information.
   *
   * @default false
   */
  isDebugEnabled: boolean = false;

  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS
  // ****************************************************************

  private readonly internalID: string;

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

  // ****************************************************************
  // ⚓ CONSTRUCTOR
  // ****************************************************************

  /**
   * Creates a new Element instance.
   *
   * @param name name of element.
   * @param scene engine reference
   * @param properties Element properties to apply
   */
  constructor(name: string, engine: Engine, properties: ElementProperties = {}) {
    this.name = name;
    this.internalID = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    this.engine = engine;

    this.position = properties.position ?? this.position;
    this.velocity = properties.velocity ?? this.velocity;
    this.rotation = properties.rotation ?? this.rotation;
    this.size = properties.size ?? this.size;
    this.isDebugEnabled = properties.isDebugEnabled ?? this.isDebugEnabled;

    this.previousState = this.createLastState();
  }

  // ****************************************************************
  // ⚓ PUBLIC METHODS
  // ****************************************************************

  addListener = (name: ValidEventType, callback: ((event: any) => void)): void => {
    this.engine.eventHandler.addListener(name, callback);
  }

  removeListener = (name: ValidEventType, callback: ((ev: ValidEventPayload) => void)): void => {
    this.engine.eventHandler.removeListener(name, callback);
  }

  /**
   * Called once before the first frame cycle. Accepts a generic promise to
   * allow for asynchronous loading of textures.
   *
   * @returns {Promise<any>}
   */
  preload: () => Promise<any> = async () => Promise.resolve();

  /**
   * Performs common tick logic for all elements
   *
   * @param frameTimestep the time between the current and previous frame
   */
  tick = (frameTimestep: number): void => {
    if (!this.isTickEnabled || this.isQueuedForDisposal) return;
    // ****************************************************************
    // pre-update operations

    // round down position and velocity if less than EPSILON
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

    // interpolate position based on previous frame
    if (this.isInterpolationEnabled) {
      this.position = add(this.previousState.position, mult(sub(this.position, this.previousState.position), interpolationFactor));
    }
    this.isInterpolationEnabled = true;

    // save current context
    ctx.save();

    this.internalRender(ctx, interpolationFactor);

    // restore context
    ctx.restore();
  };

  protected internalRender = (ctx: CanvasRenderingContext2D, interpolationFactor: number): void => { };

  /**
   * Immediately moves the actor to the specified position. Disables
   * interpolation for the next frame.
   *
   * @param pos position to move actor to
   */
  setPosition = (pos: Vector): void => {
    this.position = pos;
    this.isInterpolationEnabled = false;
  }

  // ****************************************************************
  // ⚓ PRIVATE METHODS
  // ****************************************************************

  protected createLastState = (): ElementState => {
    return {
      position: this.position,
      velocity: this.velocity,
      size: this.size,
    };
  };

  // ****************************************************************
  // ⚓ GETTERS
  // ****************************************************************

  get ID(): string { return this.internalID; }
}
