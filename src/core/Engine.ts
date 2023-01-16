import { vec } from "../math/vector";
import { assert } from "../util/asserts";
import Camera from "./camera";
import { EventHandler } from "../util/event_handler";
import Scene from "../elements/scene";
import { Debugger } from "./debugger";

const TARGET_FPS: number = 60;
const MAX_UPDATES_PER_FRAME: number = 240;

/**
 * Engine class. Handles actor management, update game loop, and rendering.
 *
 * @class
 */
export default class Engine {
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  readonly canvasElement: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  readonly debugger: Debugger;

  scenes: Map<string, Scene> = new Map();

  camera: Camera | null = null;

  preloadedActorCount: number = 0;

  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS (w/ getters)
  // ****************************************************************

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

  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS (w/o getters)
  // ****************************************************************

  readonly eventHandler: EventHandler;

  private isStarted: boolean = false;

  private isPreloaded: boolean = false;

  private totalActorCount: number = 0;

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


  // ****************************************************************
  // ⚓ DEBUG DECLARATIONS
  // ****************************************************************

  /**
   * Whether the engine will display a debug overlay with performance diagnostics.
   */
  private isDebugEnabled: boolean = true;


  // ****************************************************************
  // ⚓ CONSTRUCTOR
  // ****************************************************************

  /**
   * Creates a new instance of an Engine.
   *
   * @param canvasElement canvas on which to draw to
   * @param properties optional property arguments for engine
   */
  constructor(canvasElement: HTMLCanvasElement, properties: any = {}) {
    this.canvasElement = canvasElement;

    this.ctx = <CanvasRenderingContext2D>canvasElement.getContext("2d");

    let envWidth: number = Number(getComputedStyle(canvasElement).getPropertyValue("width").slice(0, -2));
    let envHeight: number = Number(getComputedStyle(canvasElement).getPropertyValue("height").slice(0, -2));

    this._canvasSize = vec(envWidth, envHeight);

    this.eventHandler = EventHandler.getInstance();

    this.fixDPI();

    this.debugger = new Debugger(this.ctx);

    this.debugger.baseSection
      .addItem("FPS", () => this._FPS)
      .addItem("runtime", () => ((performance.now() - this._engineStartTime) / 1000))
      .addItem("tick lag", () => this.lag);
  }


  // ****************************************************************
  // ⚓ PUBLIC METHODS
  // ****************************************************************

  getScenesByName = (sceneName: string): Array<Scene> => Array.from(this.scenes.values()).filter((scene) => scene.name === sceneName);

  /**
   * Starts engine update loop. Used only once at startup.
   *
   * @throws {Error} if the start function has already been called.
   */
  start = async () => {
    assert(!this.isStarted, "Engine has already been started.");

    this.fixDPI();

    // focus onto canvas on start so we can pick up key events
    this.canvasElement.tabIndex = -1;
    this.canvasElement.focus();

    this.eventHandler.addListener("onresize", () => {
      const [w, h] = this.fixDPI();
      this._canvasSize = vec(w, h);
    });

    this.updateID = requestAnimationFrame(
      this.update
    );

    this.totalActorCount = Array.from(this.scenes.values()).reduce((acc, scene) => acc + scene.actors.size, 0);

    // wait for each scene to load up assets and connect textures / animations
    await Promise.all(Array.from(this.scenes.values()).map((scene) => scene.start()));

    // initialize events
    this.eventHandler.attachEventListeners(this.canvasElement);

    this.isPreloaded = true;
    this.isStarted = true;

    this._engineStartTime = performance.now();

    this.updatePauseState(false);
  };

  /**
   * Pauses engine tick and render functions. The Engine will continue calling
   * the outer loop, but will not perform any logic.
   */
  pause = (): void => this.updatePauseState(true);

  /**
   * Resumes engine update loop.
   */
  resume = (): void => this.updatePauseState(false);

  addListener = (eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)) => this.eventHandler.addListener(eventName, callback);

  removeListener = (eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)) => this.eventHandler.removeListener(eventName, callback);


  // ****************************************************************
  // ⚓ PRIVATE METHODS
  // ****************************************************************

  /**
   * keeps track of FPS and updates all relevant actors
   *
   * @param {DOMHighResTimeStamp} timestamp - timestamp of current frame
   */
  private update = (timestamp: DOMHighResTimeStamp) => {
    this.updateID = requestAnimationFrame(this.update);

    if (!this.isPreloaded) {
      this.render(0);
      return;
    }

    // *****************************
    // Calculate delta time and lag

    let dt = timestamp - this.previousTimestamp;
    this.previousTimestamp = timestamp;

    this.lag += dt;
    this._currentEngineTime += dt;

    this._FPS = 1000 / dt;

    // Perform engine updates based on current lag
    let cycleUpdateCount = 0;
    while (this.lag >= this.targetFrameTimestep && !this.isPaused) {
      this.eventHandler.queueEvent("ontick", { deltaTime: this.targetFrameTimestep });

      Array.from(this.scenes.values())
        .filter(scene => scene.isTickEnabled)
        .forEach(scene => scene.tick(this.targetFrameTimestep));

      this.eventHandler.dispatchQueue();

      this.lag -= this.targetFrameTimestep;

      this.updatesSinceEngineStart++;

      // if the number of updates exceeds the max number of updates allowed for a single frame, panic.
      if (++cycleUpdateCount >= this.maxUpdatesPerFrame) {
        this.lag = 0;
        break;
      }
    }

    const interpolationFactor = this.lag / this.targetFrameTimestep;

    this.render(interpolationFactor);

    // filter out scenes that are queued for disposal while disposing of them
    this.scenes = new Map(Array
      .from(this.scenes.entries())
      .filter(([key, scene]) => !(scene.isQueuedForDisposal && this.removeScene(scene))));
  };


  /**
   * draws all relevant actors onto canvas
   *
   * @private
   * @param {number} interpolationFactor - interpolation value
   */
  private render = (interpolationFactor: number) => {
    if (!this.isPreloaded) this.renderPreloadScreen();
    if (this._isPaused || !this.isPreloaded) return;

    this.ctx.clearRect(0, 0, this._canvasSize.x, this._canvasSize.y);

    Array.from(this.scenes.values()).filter(scene => scene.isRenderEnabled).forEach(scene => scene.render(interpolationFactor));

    this.eventHandler.queueEvent("onrender", { interpolationFactor });

    if (this.isDebugEnabled) this.debugger.render();


    // `runtime:               ${(performance.now() - this._engineStartTime) / 1000}`,
    // `FPS:                   ${this._FPS}`,
    // `------------------------`,
    // `total ticks:           ${this.updatesSinceEngineStart}`,
    // `current tick lag:      ${this.lag}`,
    // `avg. ticks/frame:      ${this.updatesSinceEngineStart / this._currentEngineTime * 1000}`,
    // `------------------------`,
    // `active scenes:         ${Array.from(this.scenes.values()).map(scene => scene.name).join(", ")}`,
    // `frame duration:        ${1000 / this._FPS}`,
    // `render interpolation:  ${interpolationFactor}`,
  };

  private renderPreloadScreen(): void {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvasSize.x, this.canvasSize.y);

    this.ctx.font = "30px monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("LOADING...", this.canvasSize.x / 2, this.canvasSize.y / 2);

    this.ctx.strokeStyle = "white";
    this.ctx.strokeRect(this.canvasSize.x / 2 - 200, this.canvasSize.y / 2 + 32, 400, 16);
    this.ctx.fillRect(this.canvasSize.x / 2 - 200, this.canvasSize.y / 2 + 32, 400 * this.preloadedActorCount / this.totalActorCount, 16);
  }

  /**
   * fixes DPI of canvas
   *
   * @returns {[number, number]} - [scaledWidth, scaledHeight]
   */
  private fixDPI = (): [number, number] => {
    const dpi: number = window.devicePixelRatio;

    // get canvas computed dimensions
    const currentWidth: number = Number(getComputedStyle(this.canvasElement)
      .getPropertyValue("width")
      .slice(0, -2));
    const currentHeight: number = Number(getComputedStyle(this.canvasElement)
      .getPropertyValue("height")
      .slice(0, -2));

    const computedWidth: number = currentWidth * dpi;
    const computedHeight: number = currentHeight * dpi;

    // set canvas element dimensions to scaled dimensions
    this.canvasElement.setAttribute("width", String(computedWidth));
    this.canvasElement.setAttribute("height", String(computedHeight));

    return [computedWidth, computedHeight];
  };

  private updatePauseState = (isPaused: boolean) => {
    this._isPaused = isPaused;
    this.eventHandler.setIsEnginePaused(isPaused);
  }

  private removeScene = (scene: Scene) => {
    this.scenes.delete(scene.ID);
  }

  // ****************************************************************
  // ⚓ PRIVATE DECLARATION GETTERS
  // ****************************************************************

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
