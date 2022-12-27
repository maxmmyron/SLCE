import { vec } from "../math/vector";
import Actor from "../objects/actor";
import { assert } from "../util/asserts";
import EventDispatcher from "./events/event_dispatcher";
import EventSubscriber from "./events/event_subscriber";

const TARGET_FPS: number = 60;
const MAX_UPDATES_PER_CYCLE: number = 240;

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

  backgroundColor: string = "#121212";

  gravity: Vector = vec(0, 0);

  // ****************************************************************
  // ⚓ PRIVATE DECLARATIONS (w/ getters)
  // ****************************************************************

  private _actors: Array<Actor> = [];

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
   * @default MAX_UPDATES_PER_CYCLE
   */
  private readonly maxFrameUpdates: number = MAX_UPDATES_PER_CYCLE;

  private previousTimestamp: number = 0;

  /**
   * timestep of individual an individual frame in ms. Used as constant timestep for update method
   *
   * @default 1000 / TARGET_FPS
   */
  private readonly targetFrameTimestep: number = 1000 / TARGET_FPS;

  /**
   * ID of current animation frame
   *
   * @default -1
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

  update: Function | null = null;

  draw: Function | null = null;

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

    // wait for each actor to load up assets and connect textures/animations
    await Promise.all(this._actors.map((actor) => actor.preload()));

    // after all actors have been preloaded, begin measuring performance and run engine.
    this._engineStartTime = performance.now();
    this.updateID = requestAnimationFrame(
      this.performGameLoopUpdates
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
  pause = () => {
    this._isPaused = true;
    this.eventDispatcher.isEnginePaused = true;
  };

  /**
   * Resumes engine update loop.
   */
  resume = () => {
    this._isPaused = false;
    this.eventDispatcher.isEnginePaused = false;
  };

  /**
   * Attempts to add an actor to the engine.
   *
   * @param {Actor} actor
   *
   * @throws {Error} if actor is not an instance of Actor
   * @throws {Error} if actor is already in the engine
   */
  addActor = (actor: Actor) => {
    assert(!this.getActor(actor.ID), `Actor with ID of ${actor.ID} already exists.`);

    this._actors.push(actor);
  };

  /**
   * Queues an actor for disposal by setting actor's isQueuedForDisposal flag to true.
   *
   * @param {Actor} actor
   * @return {boolean} true if actor was queued for disposal
   *
   * @throws {Error} if actor does not exist in engine
   */
  removeActor = (actor: Actor): boolean => {
    // check if actor exists in engine actor array
    assert(this._actors.findIndex((a) => a.ID === actor.ID) !== -1, `Actor does not exist in engine array.`);

    // queue actor for disposal instead of removing immediately
    // this prevents actors from being removed from the array while iterating over it
    actor.isQueuedForDisposal = true;
    return true;
  };

  /**
   * Removes an actor from the engine by its ID.
   *
   * @param ID unique ID of actor to remove
   * @returns true if actor was removed; false if actor was not found
   */
  removeActorByID = (ID: string): boolean => {
    const actor = this.getActor(ID);
    return actor ? this.removeActor(actor) : false;
  };

  /**
   * Searches for a specific actor by its unique ID.
   *
   * @param ID ID of actor to search for
   * @returns {Actor | null} actor with matching ID; null if no actor is found
   */
  getActor = (ID: string): Actor | null => {
    for (let i = 0; i < this._actors.length; i++) {
      if (this._actors[i].ID === ID) {
        return this._actors[i];
      }
    }
    return null;
  };


  // ****************************************************************
  // ⚓ PRIVATE METHODS
  // ****************************************************************

  /**
   * keeps track of FPS and updates all relevant actors
   *
   * @param {DOMHighResTimeStamp} timestamp - timestamp of current frame
   */
  private performGameLoopUpdates = (timestamp: DOMHighResTimeStamp) => {
    this.updateID = requestAnimationFrame(
      this.performGameLoopUpdates
    );

    // *****************************
    // Calculate delta time and lag

    let dt = timestamp - this.previousTimestamp;
    this.previousTimestamp = timestamp;

    this.lag += dt;
    this._currentEngineTime += dt;

    this._FPS = 1000 / dt;

    // *****************************
    // Perform engine updates based on current lag

    let numUpdates = 0;
    while (
      this.lag >=
      this.targetFrameTimestep
    ) {
      this.performEngineUpdates();

      this.lag -=
        this.targetFrameTimestep;

      this.updatesSinceEngineStart++;

      // if the number of updates exceeds the max number of updates allowed for a single frame, panic.
      if (++numUpdates >= this.maxFrameUpdates) {
        this.lag = 0;
        break;
      }
    }

    // *****************************
    // Calculate interpolation and perform draw calls

    const interp =
      this.lag /
      this.targetFrameTimestep;

    this.performDrawCalls(interp);

    // *****************************
    // Post-update operations

    // filter actors array by those that are NOT queued for disposal
    this._actors.filter((actor) => !actor.isQueuedForDisposal);
  };

  performEngineUpdates = () => {
    if (this._isPaused) return;

    // *****************************
    // actor update operations

    this._actors.forEach((actor) => {
      actor.performUpdates(this.targetFrameTimestep);
    });

    // perform user-defined update callback (if provided)
    if (this.update) this.update(this.targetFrameTimestep);

    // get a list of current events in the queue
    const queuedEventTypes = this.eventDispatcher.eventList.map(
      (event) => event.type
    );

    // get a list of all actors that currently have events that match queued events
    const relevantActors = this._actors.filter((actor) => {
      if (!actor.subscribedEvents.size) return false;

      for (const eventType of queuedEventTypes) {
        if (actor.subscribedEvents.has(eventType)) return true;
      }
    });

    this.eventDispatcher.eventList.forEach((event) => {
      const eventType = event.type;
      const eventPayload = event.payload;

      // loop through relevant actors, and perform event callbacks for each actor that has subscribed to the current event
      relevantActors.forEach((actor) => {
        actor.subscribedEvents.forEach((subscribedEvent, actorEventType) => {
          if (actorEventType === eventType) {
            subscribedEvent.forEach((callback) => callback(eventPayload));
          }
        });
      });

      // perform event callbacks for events engine has subscribed to
      this.subscribedEvents.forEach((subscribedEvent, EngineEvents) => {
        if (EngineEvents === eventType) {
          subscribedEvent.forEach((callback) => callback(eventPayload));
        }
      });
    });

    // remove events labeled as non persistent from queue.
    this.eventDispatcher.eventList = this.eventDispatcher.eventList.filter(
      (event) => event.isPersistent
    );
  };

  /**
   * draws all relevant actors onto canvas
   *
   * @private
   * @param {number} interp - interpolation value
   */
  performDrawCalls = (interp: number) => {
    // *****************************
    // pre-draw operations

    if (this._isPaused) return;

    // clear canvas
    this.ctx.clearRect(
      0,
      0,
      this._canvasSize.x,
      this._canvasSize.y
    );

    // reset context fill color
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(
      0,
      0,
      this._canvasSize.x,
      this._canvasSize.y
    );

    // *****************************
    // primary draw operations

    this._actors.forEach((actor) => actor.performDrawCalls(this.ctx, interp));

    // call user-defined draw callback (if provided)
    if (this.draw) this.draw(interp, this.ctx);

    // *****************************
    // post-draw operations

    if (this.isDebugEnabled) {
      this.performDebugDrawCalls(interp);
    }
  };


  // ****************************************************************
  // ⚓ DEBUG METHODS
  // ****************************************************************

  private performDebugDrawCalls = (interp: number) => {
    this.ctx.fillStyle = "white";
    if (!isNaN(this._FPS)) {
      this.ctx.fillText("FPS: " + this._FPS, 5, 15);
      this.ctx.fillText("dt: " + 1000 / this._FPS, 5, 25);
      this.ctx.fillText("lag: " + this.lag, 5, 35);
      this.ctx.fillText("interp: " + interp, 5, 45);
      this.ctx.fillText(
        "total updates: " + this.updatesSinceEngineStart,
        5,
        55
      );
      this.ctx.fillText(
        "runtime: " +
        (performance.now() - this._engineStartTime) / 1000,
        5,
        65
      );
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

  // ****************************************************************
  // ⚓ PRIVATE DECLARATION GETTERS
  // ****************************************************************

  /**
   * Returns the current list of actors.
   */
  get actors(): Array<Actor> {
    return this._actors;
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
