import { vec } from "../math/Vector";
import Actor from "../objects/Actor";
import { assert } from "../util/Asserts";
import EventDispatcher from "./EventDispatcher";
import EventSubscriber from "./EventSubscriber";

const TARGET_FPS: number = 60;
const MAX_UPDATES_PER_CYCLE: number = 240;

/**
 * Engine class. Handles actor management, update game loop, and rendering.
 */
export default class Engine extends EventSubscriber {
  /**
   * Creates a new instance of an Engine.
   *
   * @constructor
   * @param {HTMLCanvasElement} canvasDOM canvas on which to draw to
   * @param {Object} properties optional property arguments for engine
   */
  constructor(canvasDOM: HTMLCanvasElement, properties: any = {}) {
    super();

    this.canvasDOM = canvasDOM;

    /**
     * Canvas context for canvas draw calls
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = canvasDOM.getContext("2d");

    let envWidth: number = Number(getComputedStyle(canvasDOM).getPropertyValue("width").slice(0, -2));
    let envHeight: number = Number(getComputedStyle(canvasDOM).getPropertyValue("height").slice(0, -2));

    this.environment.properties.size = vec(
      envWidth,
      envHeight
    );

    this.fixDPI();

    this.eventDispatcher = new EventDispatcher(
      canvasDOM,
      this.engineRecord.properties.isPaused
    );
  }

  // ****************************************************************
  // Public defs

  canvasDOM: HTMLCanvasElement;

  ctx: CanvasRenderingContext2D;

  /**
   * Current environment variables. Stores canvas runtime info and physics settings.
   *
   * @namespace environment
   */
  environment = {
    /**
     * Boolean flags and (primarily) static variables
     */
    properties: {
      /**
       * The background color of the canvas
       *
       * @type {string}
       * @default "#121212"
       */
      background: "#121212",

      /**
       * The current size of the canvas
       *
       * @type {Vector}
       * @default vec()
       */
      size: vec(),

      /**
       * A variety of environment physics settings
       */
      physics: {
        /**
         * The current global acceleration (gravity) within the environment. Acts upon all non-static actors.
         *
         * @type {Vector}
         * @default vec()
         */
        accel: vec(),
      },
    },
    /**
     * Frequently updated variables. Used to keep track of information related to performance logging and debugging
     */
    metrics: {
      /**
       * Current time in milliseconds since engine was started.
       *
       * @type {number}
       * @default 0
       */
      currentEngineTime: 0,
    },
  };

  update: Function | null = null;

  draw: Function | null = null;

  /**
   * Starts engine update loop. Used only once at startup.
   *
   * @throws {Error} if the start function has already been called.
   */
  start = async () => {
    assert(!this.engineRecord.properties.isStarted, "Engine has already been started.");

    this.fixDPI();

    // focus onto canvas on start so we can pick up key events
    this.canvasDOM.tabIndex = -1;
    this.canvasDOM.focus();

    this.subscribe("oncanvasresize", () => {
      const dimensions = this.fixDPI();
      // set canvas width and height to scaled width and height
      this.environment.properties.size = vec(dimensions[0], dimensions[1]);
    });

    // wait for each actor to load up assets and connect textures/animations
    await Promise.all(this.actors.map((actor) => actor.preload()));

    // after all actors have been preloaded, begin measuring performance and run engine.
    this.debugRecord.metrics.startTime = performance.now();
    this.updateRecord.metrics.animationFrameID = requestAnimationFrame(
      this.performGameLoopUpdates
    );

    this.engineRecord.properties.isStarted = true;
    this.engineRecord.properties.isPaused = false;

    // initialize events
    this.eventDispatcher.attachAllEvents();
  };

  /**
   * Pauses engine update loop. Game will continue requesting
   * animation frames, but will not continue to update or draw.
   */
  pause = () => {
    this.engineRecord.properties.isPaused = true;
    this.eventDispatcher.isEnginePaused = true;
  };

  /**
   * Resumes engine update loop.
   */
  resume = () => {
    this.engineRecord.properties.isPaused = false;
    this.eventDispatcher.isEnginePaused = false;
  };

  /**
   * Attempts to add an actor to the engine.
   *
   * @param {Actor} actor
   *
   * @throws {Error} if actor is not an instance of Actor
   */
  addActor = (actor: Actor) => {
    this.actors.push(actor);
  };

  /**
   * Queues an actor for disposal by setting actor's willDispose flag to true.
   *
   * @param {Actor} actor
   * @return {boolean} true if actor was queued for disposal
   *
   * @throws {Error} if actor is not an instance of Actor
   */
  removeActor = (actor: Actor): boolean => {
    // queue actor for disposal instead of removing immediately
    // this prevents actors from being removed from the array while iterating over it
    actor.willDispose = true;
    return true;
  };

  /**
   * Returns an array of current actors in engine
   *
   * @returns {Array<Actor>} an array of all actors in the engine
   */
  getActors = (): Array<Actor> => this.actors;

  // ****************************************************************
  // Private defs

  /**
   * Relevant generic engine properties
   *
   * @namespace engineRecord
   * @private
   */
  private engineRecord = {
    /**
     * Boolean flags and (primarily) static properties
     */
    properties: {
      /**
       * Whether or not engine is paused
       *
       * @type {boolean}
       * @default false
       */
      isPaused: false,

      /**
       * Whether or not engine has started
       *
       * @type {boolean}
       * @default false
       */
      isStarted: false,
    },
  };

  /**
   * Relevant properties used exclusively during the update cycle.
   *
   * @namespace updateRecord
   * @private
   */
  private updateRecord = {
    /**
     * Boolean flags and (primarily) static variables
     */
    properties: {
      /**
       * Maximum number of updates to perform between draw calls. If this number is exceeded, engine will panic and reset metrics.
       *
       * @type {number}
       * @default MAX_UPDATES_PER_CYCLE (240)
       */
      maxFrameUpdates: MAX_UPDATES_PER_CYCLE,

      /**
       * UNUSED
       * Target FPS to attempt to achieve when running updates.
       *
       * @type {number}
       * @default TARGET_FPS (60)
       */
      targetFPS: TARGET_FPS,

      /**
       * timestep of individual an individual frame in ms. Used as constant timestep for update method
       *
       * @type {number}
       * @default 1000 / TARGET_FPS
       */
      targetFrameTimestep: 1000 / TARGET_FPS,
    },
    /**
     * Frequently updated variables
     */
    metrics: {
      /**
       * ID of current animation frame
       *
       * @type {number}
       * @default -1
       */
      animationFrameID: -1,

      /**
       * Accumulated lag time between updates in ms. Used to determine how many updates to perform in a single frame.
       *
       * @type {number}
       * @default 0
       */
      lag: 0,

      /**
       * Timestamp of last frame in ms
       *
       * @type {number}
       * @default 0
       */
      prevTimestamp: 0,
    },
  };

  /**
   * Relevant properties for debugging and performance logging. Composed primarily of either boolean flags or constant properties.
   *
   * @namespace debugRecord
   * @private
   */
  private debugRecord = {
    /**
     * Boolean flags and (primarily) static variables
     */
    properties: {
      /**
       * Whether or not the engine will display a debug overlay with performance diagnostics.
       *
       * @type {boolean}
       * @default true
       */
      isPerformanceDebugScreenEnabled: true,

      /**
       * Whether or not the engine will log out performance diagnostics to the console.
       *
       * @type {boolean}
       * @default true
       */
      isPerformanceLoggingEnabled: false,
    },

    /**
     * Frequently updated variables. Used to keep track of information related to performance logging and debugging
     */
    metrics: {
      /**
       * current FPS of engine
       *
       * @type {number}
       * @default 0
       */
      FPS: 0,

      /**
       * Unix timestamp of when engine was started
       *
       * @type {number}
       * @default 0
       */
      startTime: 0,

      /**
       * Cumulative number of updates performed since engine was started
       *
       * @type {number}
       * @default 0
       */
      updatesSinceStart: 0,
    },
  };

  /**
   * An array of actors to be updated and drawn by the canvas
   *
   * @private
   * @type {Array<Actor>}
   */
  private actors: Array<Actor> = [];

  /**
   * An instance of EventDispatcher to handle events
   *
   * @private
   * @type {EventDispatcher}
   */
  private eventDispatcher: EventDispatcher;

  /**
   * keeps track of FPS and updates all relevant actors
   *
   * @private
   * @param {DOMHighResTimeStamp} timestamp - timestamp of current frame
   */
  private performGameLoopUpdates = (timestamp: DOMHighResTimeStamp) => {
    this.updateRecord.metrics.animationFrameID = requestAnimationFrame(
      this.performGameLoopUpdates
    );

    // *****************************
    // Calculate delta time and lag

    let dt = timestamp - this.updateRecord.metrics.prevTimestamp;
    this.updateRecord.metrics.prevTimestamp = timestamp;

    this.updateRecord.metrics.lag += dt;
    this.environment.metrics.currentEngineTime += dt;

    this.debugRecord.metrics.FPS = 1000 / dt;

    // *****************************
    // Perform engine updates based on current lag

    let numUpdates = 0;
    while (
      this.updateRecord.metrics.lag >=
      this.updateRecord.properties.targetFrameTimestep
    ) {
      this.performEngineUpdates();

      this.updateRecord.metrics.lag -=
        this.updateRecord.properties.targetFrameTimestep;

      this.debugRecord.metrics.updatesSinceStart++;

      // if the number of updates exceeds the max number of updates allowed for a single frame, panic.
      if (++numUpdates >= this.updateRecord.properties.maxFrameUpdates) {
        this.updateRecord.metrics.lag = 0;
        break;
      }
    }

    // *****************************
    // Calculate interpolation and perform draw calls

    const interp =
      this.updateRecord.metrics.lag /
      this.updateRecord.properties.targetFrameTimestep;

    this.performDrawCalls(interp);

    // *****************************
    // Post-update operations

    // filter actors array by those that are NOT queued for disposal
    this.actors.filter((actor) => !actor.willDispose);
  };

  performEngineUpdates = () => {
    if (this.engineRecord.properties.isPaused) return;

    // *****************************
    // actor update operations

    this.actors.forEach((actor) => {
      actor.performUpdates(
        this.updateRecord.properties.targetFrameTimestep,
        this.environment
      );
    });

    // perform user-defined update callback (if provided)
    if (this.update)
      this.update(
        this.updateRecord.properties.targetFrameTimestep,
        this.environment
      );

    // get a list of current events in the queue
    const queuedEventTypes = this.eventDispatcher.eventList.map(
      (event) => event.type
    );

    // get a list of all actors that currently have events that match queued events
    const relevantActors = this.actors.filter((actor) => {
      if(!actor.subscribedEvents.size) return false;

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

    if (this.engineRecord.properties.isPaused) return;

    // clear canvas
    this.ctx.clearRect(
      0,
      0,
      this.environment.properties.size.x,
      this.environment.properties.size.y
    );

    // reset context fill color
    this.ctx.fillStyle = this.environment.properties.background;
    this.ctx.fillRect(
      0,
      0,
      this.environment.properties.size.x,
      this.environment.properties.size.y
    );

    // *****************************
    // primary draw operations

    this.actors.forEach((actor) => actor.performDrawCalls(this.ctx, interp));

    // call user-defined draw callback (if provided)
    if (this.draw) this.draw(interp, this.ctx);

    // *****************************
    // post-draw operations

    if (this.debugRecord.properties.isPerformanceDebugScreenEnabled) {
      this.performDebugDrawCalls(interp);
    }
  };

  performDebugDrawCalls = (interp: number) => {
    this.ctx.fillStyle = "white";
    if (!isNaN(this.debugRecord.metrics.FPS)) {
      this.ctx.fillText("FPS: " + this.debugRecord.metrics.FPS, 5, 15);
      this.ctx.fillText("dt: " + 1000 / this.debugRecord.metrics.FPS, 5, 25);
      this.ctx.fillText("lag: " + this.updateRecord.metrics.lag, 5, 35);
      this.ctx.fillText("interp: " + interp, 5, 45);
      this.ctx.fillText(
        "total updates: " + this.debugRecord.metrics.updatesSinceStart,
        5,
        55
      );
      this.ctx.fillText(
        "runtime: " +
          (performance.now() - this.debugRecord.metrics.startTime) / 1000,
        5,
        65
      );
    }
  };

  /**
   * fixes DPI of canvas
   *
   * @private
   * @returns {[number, number]} - [scaledWidth, scaledHeight]
   */
  fixDPI = (): [number, number] => {
    const dpi: number = window.devicePixelRatio;

    // set current computed canvas dimensions
    const style_width: number = Number(getComputedStyle(this.canvasDOM)
      .getPropertyValue("width")
      .slice(0, -2));
    const style_height: number = Number(getComputedStyle(this.canvasDOM)
      .getPropertyValue("height")
      .slice(0, -2));

    // scale dimensions by DPI
    const w: number = style_width * dpi;
    const h: number = style_height * dpi;

    // set canvas element dimensions to scaled dimensions
    this.canvasDOM.setAttribute("width", String(w));
    this.canvasDOM.setAttribute("height", String(h));

    return [w, h];
  };
}
