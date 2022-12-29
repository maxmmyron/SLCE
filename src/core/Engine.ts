import { vec } from "../math/vector";
import { assert } from "../util/asserts";
import { Camera } from "./camera";
import EventDispatcher from "./events/event_dispatcher";
import EventSubscriber from "./events/event_subscriber";
import { Scene } from "./scene";

const TARGET_FPS: number = 60;
const MAX_UPDATES_PER_FRAME: number = 240;

/**
 * Engine class. Handles actor management, update game loop, and rendering.
 *
 * @class
 */
export default class Engine extends EventSubscriber {
  // ****************************************************************
  // ⚓ PUBLIC DECLARATIONS
  // ****************************************************************

  readonly canvasElement: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  scenes: Map<string, Scene> = new Map();

  camera: Camera | null = null;

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

  private readonly eventDispatcher: EventDispatcher;

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


  // ****************************************************************
  // ⚓ DEBUG DECLARATIONS
  // ****************************************************************

  /**
   * Whether the engine will display a debug overlay with performance diagnostics.
   */
  private isDebugEnabled: boolean = true;

  /**
   * Whether the engine will log performance metrics to the console.
   */
  private isLoggingEnabled: boolean = false;


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
    super();

    this.canvasElement = canvasElement;

    this.ctx = canvasElement.getContext("2d") as CanvasRenderingContext2D;

    let envWidth: number = Number(getComputedStyle(canvasElement).getPropertyValue("width").slice(0, -2));
    let envHeight: number = Number(getComputedStyle(canvasElement).getPropertyValue("height").slice(0, -2));

    this._canvasSize = vec(envWidth, envHeight);

    this.fixDPI();

    this.eventDispatcher = new EventDispatcher(canvasElement, this.isPaused);
  }


  // ****************************************************************
  // ⚓ PUBLIC METHODS
  // ****************************************************************

  getScenesByName = (sceneName: string): Array<Scene> => Array.from(this.scenes.values()).filter((scene) => scene.name === sceneName);

  update: ((targetFrameTimestep: number) => void) | null = null;

  render: ((interpolationFactor: number) => void) | null = null;

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

    this.subscribe("oncanvasresize", () => {
      const dimensions = this.fixDPI();
      // set canvas width and height to scaled width and height
      this._canvasSize = vec(dimensions[0], dimensions[1]);
    });

    // wait for each scene to load up assets and connect textures/animations
    await Promise.all(Array.from(this.scenes.values()).map((scene) => scene.preload()));

    // begin measuring performance and run engine.
    this._engineStartTime = performance.now();
    this.updateID = requestAnimationFrame(
      this.loop
    );

    this.isStarted = true;
    this._isPaused = false;

    // initialize events
    this.eventDispatcher.attachAllEvents();
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


  // ****************************************************************
  // ⚓ PRIVATE METHODS
  // ****************************************************************

  /**
   * keeps track of FPS and updates all relevant actors
   *
   * @param {DOMHighResTimeStamp} timestamp - timestamp of current frame
   */
  private loop = (timestamp: DOMHighResTimeStamp) => {
    this.updateID = requestAnimationFrame(this.loop);

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
      Array.from(this.scenes.values()).filter(scene => scene.isUpdateEnabled).forEach(scene => scene.update(this.targetFrameTimestep));

      // perform user-defined update callback (if provided)
      if (this.update) this.update(this.targetFrameTimestep);

      this.lag -= this.targetFrameTimestep;

      this.updatesSinceEngineStart++;

      // if the number of updates exceeds the max number of updates allowed for a single frame, panic.
      if (++cycleUpdateCount >= this.maxUpdatesPerFrame) {
        this.lag = 0;
        break;
      }
    }

    const interpolationFactor = this.lag / this.targetFrameTimestep;

    this.renderEngineElements(interpolationFactor);

    // filter scene map by those that are NOT queued for disposal
    this.scenes = new Map(Array
      .from(this.scenes.entries())
      .filter(([key, scene]) => !scene.isQueuedForDisposal));
  };

  private updateEngineElements = () => {

    // *****************************
    // update operations

    // get a list of current events in the queue
    // const queuedEventTypes = this.eventDispatcher.eventList.map(
    //   (event) => event.type
    // );

    // // get a list of all actors that currently have events that match queued events
    // const relevantActors = this._actors.filter((actor) => {
    //   if (!actor.subscribedEvents.size) return false;

    //   for (const eventType of queuedEventTypes) {
    //     if (actor.subscribedEvents.has(eventType)) return true;
    //   }
    // });

    // this.eventDispatcher.eventList.forEach((event) => {
    //   const eventType = event.type;
    //   const eventPayload = event.payload;

    //   // loop through relevant actors, and perform event callbacks for each actor that has subscribed to the current event
    //   relevantActors.forEach((actor) => {
    //     actor.subscribedEvents.forEach((subscribedEvent, actorEventType) => {
    //       if (actorEventType === eventType) {
    //         subscribedEvent.forEach((callback) => callback(eventPayload));
    //       }
    //     });
    //   });

    //   // perform event callbacks for events engine has subscribed to
    //   this.subscribedEvents.forEach((subscribedEvent, EngineEvents) => {
    //     if (EngineEvents === eventType) {
    //       subscribedEvent.forEach((callback) => callback(eventPayload));
    //     }
    //   });
    // });

    // remove events labeled as non persistent from queue.
    this.eventDispatcher.eventList = this.eventDispatcher.eventList.filter(
      (event) => event.isPersistent
    );
  };


  /**
   * draws all relevant actors onto canvas
   *
   * @private
   * @param {number} interpolationFactor - interpolation value
   */
  private renderEngineElements = (interpolationFactor: number) => {
    // *****************************
    // pre-draw operations
    if (this._isPaused) return;

    // clear canvas
    this.ctx.clearRect(0, 0, this._canvasSize.x, this._canvasSize.y);

    // *****************************
    // primary draw operations

    Array.from(this.scenes.values()).filter(scene => scene.isRenderEnabled).forEach(scene => scene.render(interpolationFactor));

    // call user-defined draw callback (if provided)
    if (this.render) this.render(interpolationFactor);

    // *****************************
    // post-draw operations

    if (this.isDebugEnabled) {
      this.executeDebugRender(interpolationFactor);
    }
  };

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

    // scale dimensions by DPI
    const computedWidth: number = currentWidth * dpi;
    const computedHeight: number = currentHeight * dpi;

    // set canvas element dimensions to scaled dimensions
    this.canvasElement.setAttribute("width", String(computedWidth));
    this.canvasElement.setAttribute("height", String(computedHeight));

    return [computedWidth, computedHeight];
  };

  private updatePauseState = (newPauseState: boolean) => {
    this._isPaused = newPauseState;
    this.eventDispatcher.isEnginePaused = newPauseState;
  }


  // ****************************************************************
  // ⚓ DEBUG METHODS
  // ****************************************************************

  private executeDebugRender = (interpolationFactor: number) => {
    this.ctx.fillStyle = "white";
    if (!isNaN(this._FPS)) {
      this.ctx.fillText("FPS: " + this._FPS, 5, 15);
      this.ctx.fillText("dt: " + 1000 / this._FPS, 5, 25);
      this.ctx.fillText("lag: " + this.lag, 5, 35);
      this.ctx.fillText("interpolation: " + interpolationFactor, 5, 45);
      this.ctx.fillText("total updates: " + this.updatesSinceEngineStart, 5, 55);
      this.ctx.fillText("runtime: " + (performance.now() - this._engineStartTime) / 1000, 5, 65);
    }
  };

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
