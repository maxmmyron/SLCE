import { vec } from "../math/vector";
import { assert } from "../util/asserts";
import Camera from "./camera";
import { EventHandler } from "../util/event_handler";
import Scene from "../elements/scene";

const TARGET_FPS: number = 60;
const MAX_UPDATES_PER_FRAME: number = 240;

/**
 * Engine class. Handles actor management, update game loop, and rendering.
 *
 * @class
 */
export default class Engine {

  readonly canvasElement: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  scenes: Map<string, Scene> = new Map();

  camera: Camera | null = null;

  private _canvasSize: Vector;

  /**
   * Current runtime of engine in milliseconds
   */
  private _currentEngineTime: number = 0;

  /**
   * Unix timestamp of when engine was started
   */
  private _engineStartTime: number = 0;

  private _FPS: number = 0;

  private _isPaused: boolean = false;

  readonly eventHandler: EventHandler;

  private isStarted: boolean = false;

  /**
   * Accumulated lag time between updates in ms. Used to determine how many updates to perform in a single frame.
   */
  private lag: number = 0;

  /**
   * Maximum number of updates to perform between draw calls. If this number is exceeded, engine will panic and reset metrics.
   *
   * @default MAX_UPDATES_PER_FRAME
   */
  private readonly maxUpdatesPerFrame: number = MAX_UPDATES_PER_FRAME;

  private previousTimestamp: number = 0;

  /**
   * timestep of an individual frame in ms. Used as constant timestep for update method
   *
   * @default 1000 / TARGET_FPS
   */
  private readonly targetFrameTimestep: number = 1000 / TARGET_FPS;

  /**
   * ID of current animation frame
   *
   * @default -1
   * @unused
   */
  private updateID: number = -1;

  private updatesSinceEngineStart: number = 0;


  /**
   * Whether the engine will display a debug overlay with performance diagnostics.
   */
  private isDebugEnabled: boolean = true;

  /**
   * Whether the engine will log performance metrics to the console.
   */
  private isLoggingEnabled: boolean = false;


  /**
   * Creates a new instance of an Engine.
   *
   * @param canvasElement canvas on which to draw to
   * @param properties optional property arguments for engine
   */
  constructor(canvasElement: HTMLCanvasElement, properties: any = {}) {
    this.canvasElement = canvasElement;

    this.ctx = canvasElement.getContext("2d") as CanvasRenderingContext2D;

    let envWidth: number = Number(getComputedStyle(canvasElement).getPropertyValue("width").slice(0, -2));
    let envHeight: number = Number(getComputedStyle(canvasElement).getPropertyValue("height").slice(0, -2));

    this._canvasSize = vec(envWidth, envHeight);

    this.eventHandler = EventHandler.getInstance();

    this.fixDPI();
  }


  getScenesByName = (sceneName: string): Array<Scene> => Array.from(this.scenes.values()).filter(scene => scene.name === sceneName);

  /**
   * Starts engine update loop. Used only once at startup.
   *
   * @throws {Error} if the start function has already been called.
   */
  start = async () => {
    assert(!this.isStarted, "Engine has already been started.");

    this.fixDPI();

    this.canvasElement.tabIndex = -1;
    this.canvasElement.focus();

    await Promise.all(Array.from(this.scenes.values()).map(scene => scene.preload()));

    this.eventHandler.attachEventListeners(this.canvasElement);
    this.eventHandler.addListener("onresize", () => this._canvasSize = this.fixDPI());

    this._engineStartTime = performance.now();
    this.updateID = requestAnimationFrame(this.update);

    this.isStarted = true;
    this.updatePauseState(false);
  };

  /**
   * Pauses engine update loop. Game will continue requesting
   * animation frames, but will not continue to update or draw.
   */
  pause = () => this.updatePauseState(true);

  /**
   * Resumes engine update loop.
   */
  resume = () => this.updatePauseState(false);

  addListener = (eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)) => this.eventHandler.addListener(eventName, callback);

  removeListener = (eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)) => this.eventHandler.removeListener(eventName, callback);


  /**
   * keeps track of FPS and updates all relevant actors
   *
   * @param {DOMHighResTimeStamp} timestamp timestamp of current frame
   */
  private update = (timestamp: DOMHighResTimeStamp) => {
    this.updateID = requestAnimationFrame(this.update);

    const delta = timestamp - this.previousTimestamp;
    this.previousTimestamp = timestamp;

    this.lag += delta;
    this._currentEngineTime += delta;

    this._FPS = 1000 / delta;

    let cycleUpdateCount = 0;
    while (this.lag >= this.targetFrameTimestep && !this.isPaused) {
      this.eventHandler.queueEvent("ontick", { deltaTime: this.targetFrameTimestep });

      Array.from(this.scenes.values())
        .filter(scene => scene.isTickEnabled)
        .forEach(scene => scene.tick(this.targetFrameTimestep));

      this.eventHandler.dispatchQueue();

      this.lag -= this.targetFrameTimestep;

      this.updatesSinceEngineStart++;

      if (++cycleUpdateCount >= this.maxUpdatesPerFrame) {
        this.lag = 0;
        break;
      }
    }

    this.render(this.lag / this.targetFrameTimestep);

    this.scenes = new Map(Array
      .from(this.scenes.entries())
      .filter(([key, scene]) => !(scene.isQueuedForDisposal && this.removeScene(scene))));
  };


  /**
   * draws all relevant actors onto canvas
   *
   * @private
   * @param {number} interpolationFactor interpolation value
   */
  private render = (interpolationFactor: number) => {
    if (this._isPaused) return;

    this.ctx.clearRect(0, 0, this._canvasSize.x, this._canvasSize.y);

    Array.from(this.scenes.values()).filter(scene => scene.isRenderEnabled).forEach(scene => scene.render(interpolationFactor));

    this.eventHandler.queueEvent("onrender", { interpolationFactor });

    if (!this.isDebugEnabled || isNaN(this._FPS)) return;

    const debugLines = [
      `runtime:               ${(performance.now() - this._engineStartTime) / 1000}`,
      `FPS:                   ${this._FPS}`,
      `------------------------`,
      `total ticks:           ${this.updatesSinceEngineStart}`,
      `current tick lag:      ${this.lag}`,
      `avg. ticks/frame:      ${this.updatesSinceEngineStart / this._currentEngineTime * 1000}`,
      `------------------------`,
      `active scenes:         ${Array.from(this.scenes.values()).map(scene => scene.name).join(", ")}`,
      `frame duration:        ${1000 / this._FPS}`,
      `render interpolation:  ${interpolationFactor}`,
    ];

    debugLines.forEach((line, index) => {
      this.ctx.font = "11px monospace";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(line, 5, 15 + (index * 12));
    });
  };

  /**
   * fixes DPI of canvas
   *
   * @returns {Vector} new canvas size
   */
  private fixDPI = (): Vector => {
    let width: number = Number(getComputedStyle(this.canvasElement)
      .getPropertyValue("width")
      .slice(0, -2));
    let height: number = Number(getComputedStyle(this.canvasElement)
      .getPropertyValue("height")
      .slice(0, -2));

    width *= window.devicePixelRatio;
    height *= window.devicePixelRatio;

    this.canvasElement.setAttribute("width", String(width));
    this.canvasElement.setAttribute("height", String(height));

    return vec(width, height);
  };

  private updatePauseState = (isPaused: boolean) => {
    this._isPaused = isPaused;
    this.eventHandler.setIsEnginePaused(isPaused);
  }

  private removeScene = (scene: Scene) => {
    this.scenes.delete(scene.ID);
  }

  get canvasSize(): Vector {
    return this._canvasSize;
  }

  get currentEngineTime(): number {
    return this._currentEngineTime;
  }

  get engineStartTime(): number {
    return this._engineStartTime;
  }

  get FPS(): number {
    return this._FPS;
  }

  get isPaused(): boolean {
    return this._isPaused;
  }
}
