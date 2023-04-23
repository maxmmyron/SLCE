import Scene from "@/elements/scene";
import { assert } from "@/util/asserts";
import EventHandler from "@/util/EventHandler";
import Vector2D from "@/math/Vector2D";
import TextureHandler from "@/util/TextureHandler";
import ParameterGUI from "./gui";

const TARGET_FPS: number = 60;
const MAX_UPDATES_PER_FRAME: number = 240;

/**
 * Engine class. Handles actor management, update game loop, and rendering.
 *
 * @class
 */
export default class Engine implements Engineable {

  /**
   * Canvas element on which to attach context and event listeners
   *
   * @readonly
   */
  readonly canvasElement: HTMLCanvasElement;

  /**
   * Canvas context to draw to. Initialized on engine start.
   *
   * @readonly
   */
  readonly ctx: CanvasRenderingContext2D;

  /**
   * The engine's parameter
   *
   * @readonly
   */
  readonly parameterGUI: GUIable

  /**
   * An eventHandler used to manage event listeners.
   *
   * @readonly
   */
  readonly eventHandler: EventHandler;

  /**
   * A texture handler used to manage textures.
   *
   * @readonly
   */
  readonly textureHandler: TextureHandler;

  /**
   * A map containing string IDs and associated scenes.
   *
   * @default new Map()
   */
  scenes: Map<string, Scene> = new Map();

  /**
   * A count of actors that have been successfully preloaded.
   * Used during engine start to determine preload progress.
   *
   * @default 0
   */
  preloadedActorCount: number = 0;

  /**
   * Whether or not the engine has paused ticks and render calls.
   *
   * @default false
   */
  isPaused: boolean = true;

  /**
   * The current size of the canvas element.
   *
   * @private
   */
  private _canvasSize: Vector2D;

  /**
   * The current engine runtime in milliseconds.
   *
   * @private
   * @default 0
   */
  private _engineRuntimeMilliseconds: number = 0;

  /**
   * High-res timestamp of engine start.
   *
   * @private
   * @default 0
   */
  private _engineStartTimestamp: number = 0;

  /**
   * The current FPS of the engine.
   *
   * @private
   * @default 0
   */
  private _FPS: number = 0;

  /**
   * Whether or not the engine has been initialized. This flag only changes
   * once during the engine's lifetime.
   *
   * @private
   * @default false
   */
  private isStarted: boolean = false;

  /**
   * Whether or not the engine has finished preload operations.
   *
   * @private
   * @default false
   */
  private isPreloaded: boolean = false;

  /**
   * The total number of actors that are currently in the engine.
   * Used to determine preload progress.
   *
   * @private
   * @default 0
   */
  private totalActorCount: number = 0;

  /**
   * Accumulated lag time between updates in ms. Used to determine how many
   * updates to perform in a single frame.
   */
  private lag: number = 0;

  /**
   * Maximum number of updates to perform between draw calls. If this number is
   * exceeded, the engine will panic and reset the lag accumulator.
   *
   * @default MAX_UPDATES_PER_FRAME
   */
  private readonly maxUpdatesPerFrame: number = MAX_UPDATES_PER_FRAME;

  /**
   * The previous high-res timestamp of the engine in milliseconds. Used to calculate the
   * delta time between frames.
   *
   * @private
   * @default 0
   */
  private previousUpdateTimestamp: DOMHighResTimeStamp = 0;

  /**
   * Ideal tick duration in milliseconds. Used for update calculations.
   *
   * @default 1000 / TARGET_FPS
   */
  private readonly targetTickDurationMilliseconds: number = 1000 / TARGET_FPS;

  /**
   * Current ID of update loop.
   *
   * @private
   * @default -1
   * @unused
   */
  private updateID: number = -1;

  /**
   * Number of ticks that have occurred since engine start. Used to calculate
   * FPS.
   *
   * @private
   * @default 0
   * @unused
   */
  private updatesSinceEngineStart: number = 0;

  /**
   * The current rendering scale of the canvas. At a low level, this value is
   * equivalent to the window device pixel ratio.
   *
   * @private
   * @default 1
   */
  private canvasScale: number = 1;

  /**
   * Creates a new Engine instance.
   *
   * @param canvasElement the canvas element to render to.
   * @param defaultProperties default properties to apply to the engine.
   */
  constructor(canvasElement: HTMLCanvasElement, defaultProperties: Partial<DefaultEngineProperties> = {}) {
    this.canvasElement = canvasElement;

    this.ctx = <CanvasRenderingContext2D>canvasElement.getContext("2d");

    this.eventHandler = new EventHandler(this.canvasElement);
    this.eventHandler.setEnginePauseStateCallback(() => this.isPaused);

    this.textureHandler = new TextureHandler();

    this._canvasSize = this.fixRenderScale();

    this.parameterGUI = new ParameterGUI();
    this.parameterGUI.baseSection
      .addParameter("FPS", () => this._FPS)
      .addParameter("runtime", () => ((performance.now() - this._engineRuntimeMilliseconds) / 1000))
      .addParameter("tick lag", () => this.lag);
  }

  getScenesByName = (name: string): Array<Scene> => Array.from(this.scenes.values()).filter((scene) => scene.name === name);

  /**
   * Starts engine update loop. Used only once at startup.
   *
   * @throws {Error} if the start function has already been called.
   */
  start = async (): Promise<void> => {
    assert(!this.isStarted, "Engine has already been started.");

    this.fixRenderScale();

    this.canvasElement.tabIndex = -1;
    this.canvasElement.focus();

    this.eventHandler.registerEventCallback("onresize", () => this._canvasSize = this.fixRenderScale());

    this.eventHandler.registerEventCallback("onmousedown", (ev) => {
      ev = <MouseEventPayload>ev;
      this.parameterGUI.lastClickPosition = new Vector2D(ev.x, ev.y);
    });

    this.updateID = requestAnimationFrame(this.update);

    this.totalActorCount = Array.from(this.scenes.values()).reduce((acc, scene) => acc + scene.actors.size, 0);

    await Promise.all(Array.from(this.scenes.values()).map((scene) => scene.start()));

    this._engineStartTimestamp = performance.now();

    this.isPreloaded = true;
    this.isStarted = true;
    this.isPaused = false;
  };

  registerEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void {
    this.eventHandler.registerEventCallback(type, callback);
  }

  unregisterEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void {
    this.eventHandler.unregisterEventCallback(type, callback);
  }

  /**
   * Performs general update logic and manages tick cycle.
   *
   * @private
   *
   * @param timestamp a timestamp provided by the browser to determine the delta
   * time since the last update.
   */
  private update = (timestamp: DOMHighResTimeStamp) => {
    this.updateID = requestAnimationFrame(this.update);

    if (!this.isPreloaded) {
      this.render(0);
      return;
    }

    const delta: number = timestamp - this.previousUpdateTimestamp;
    this.previousUpdateTimestamp = timestamp;

    this.lag += delta;
    this._engineRuntimeMilliseconds += delta;

    this._FPS = 1000 / delta;

    let cycleUpdateCount: number = 0;

    while (this.lag >= this.targetTickDurationMilliseconds && !this.isPaused) {
      this.eventHandler.queueEvent("ontick", { deltaTime: this.targetTickDurationMilliseconds, type: "ontick" });
      this.eventHandler.dispatchQueue();

      Array.from(this.scenes.values())
        .filter(scene => scene.isTickEnabled)
        .forEach(scene => scene.tick(this.targetTickDurationMilliseconds));

      this.lag -= this.targetTickDurationMilliseconds;

      this.updatesSinceEngineStart++;
      if (++cycleUpdateCount >= this.maxUpdatesPerFrame) {
        this.lag = 0;
        break;
      }
    }

    this.render(this.lag / this.targetTickDurationMilliseconds);

    Array.from(this.scenes.values())
      .filter(scene => scene.isQueuedForDisposal)
      .forEach(scene => this.scenes.delete(scene.ID));
  };

  /**
   * Draws relevant elements onto the context
   *
   * @private
   *
   * @param {number} interpolationFactor interpolation value
   */
  private render = (interpolationFactor: number) => {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.ctx.scale(this.canvasScale, this.canvasScale);

    if (!this.isPreloaded) this.renderPreloadScreen();
    if (this.isPaused || !this.isPreloaded) return;

    this.ctx.clearRect(0, 0, this._canvasSize.x, this._canvasSize.y);

    Array.from(this.scenes.values()).filter(scene => scene.isRenderEnabled).forEach(scene => scene.render(interpolationFactor));

    this.eventHandler.queueEvent("onrender", { interpolationFactor, type: "onrender" });

    this.parameterGUI.render(this.ctx);
  };

  /**
   * Renders the preload screen.
   *
   * @private
   */
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
   * Normalizes the canvas size towards device DPI
   *
   * @private
   *
    * @returns the normalized canvas size
   */
  private fixRenderScale = (): Vector2D => {
    this.canvasScale = window.devicePixelRatio;

    let width: number = Number(getComputedStyle(this.canvasElement)
      .getPropertyValue("width")
      .slice(0, -2));
    let height: number = Number(getComputedStyle(this.canvasElement)
      .getPropertyValue("height")
      .slice(0, -2));

    width *= this.canvasScale;
    height *= this.canvasScale;

    this.canvasElement.setAttribute("width", String(width));
    this.canvasElement.setAttribute("height", String(height));

    return new Vector2D(width, height);
  };

  get canvasSize(): Vector2D {
    return this._canvasSize;
  }

  get engineRuntimeMilliseconds(): number {
    return this._engineRuntimeMilliseconds;
  }

  get engineStartTimestamp(): number {
    return this._engineStartTimestamp;
  }

  get FPS(): number {
    return this._FPS;
  }
}
