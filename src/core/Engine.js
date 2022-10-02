import { vec } from "../Math/Vector";
import Actor from "../Objects/Actor";
import EventHandler from "./EventHandler";

/**
 * Engine for handling game update logic and actor drawing.
 * @param {HTMLCanvasElement} canvasDOM canvas on which to draw to
 * @param {Object} options optional arguments
 */
export default class Engine {
  constructor(canvasDOM, options = {}) {
    if (!(canvasDOM instanceof HTMLCanvasElement)) {
      throw new Error("canvasDOM must be an instance of HTMLCanvasElement");
    }

    this.canvasDOM = canvasDOM;

    /**
     * Canvas context for canvas draw calls
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = canvasDOM.getContext("2d");

    /**
     * A struct of global variables.
     * @type {Object}
     */
    this.environment = {
      background: "#121212",
      width: getComputedStyle(canvasDOM).getPropertyValue("width").slice(0, -2),
      height: getComputedStyle(canvasDOM)
        .getPropertyValue("height")
        .slice(0, -2),
      physics: {
        accel: vec(),
      },
    };

    // listen for resize events and update canvas size
    document.addEventListener("resize", (e) => {
      dimensions = this.#fixDPI();
      // set canvas width and height to scaled width and height
      this.environment.width = dimensions[0];
      this.environment.height = dimensions[1];
    });

    this.#fixDPI();

    this.#eventHandler = new EventHandler(canvasDOM, this.#isPaused);
  }

  // ****************************************************************
  // Public defs

  update = null;

  draw = null;

  /**
   * Starts engine update loop. Used only once at startup.
   */
  start = () => {
    if (!this.#isStarted) {
      this.#fixDPI();
      this.#updateMetrics.animationFrameID = requestAnimationFrame(
        this.#performGameLoopUpdates
      );

      // focus onto canvas on start so we can pick up key events
      this.canvasDOM.tabIndex = -1;
      this.canvasDOM.focus();

      this.#isStarted = true;
      this.#isPaused = false;

      this.#debugMetrics.startTime = performance.now();

      // initialize events
      this.#eventHandler.attachAllEvents();
    } else {
      throw new Error(`Error starting engine: engine has already started.`);
    }
  };

  /**
   * Pauses engine update loop. Game will continue requesting
   * animation frames, but will not continue to update or draw.
   */
  pause = () => {
    this.#isPaused = true;
    this.#eventHandler.isEnginePaused = true;
  };

  /**
   * Resumes engine update loop.
   */
  resume = () => {
    this.#isPaused = false;
    this.#eventHandler.isEnginePaused = false;
  };

  /**
   * Attempts to add an actor to the engine.
   *
   * @param {Actor} actor
   * @return {Boolean} true if actor was added
   *
   * @throws {Error} if actor is not an instance of Actor
   */
  addActor = (actor) => {
    if (!(actor instanceof Actor)) {
      throw new Error(
        `Error adding actor: actor must be an instance of Actor.`
      );
    }

    this.#actors.push(actor);
  };

  /**
   * Queues an actor for disposal by setting actor's willDispose flag to true.
   *
   * @param {Actor} actor
   * @return {Boolean} true if actor was queued for disposal
   *
   * @throws {Error} if actor is not an instance of Actor
   */
  removeActor = (actor) => {
    if (!(actor instanceof Actor)) {
      throw new Error(
        `Error removing actor: actor must be an instance of Actor.`
      );
    }

    // queue actor for disposal instead of removing immediately
    // this prevents actors from being removed from the array while iterating over it
    actor.willDispose = true;
    return true;
  };

  /**
   * Returns an array of current actors in engine
   *
   * @returns {Array} an array of all actors in the engine
   */
  getActors = () => this.#actors;

  /**
   * Gets the current runtime of the engine.
   * @returns {Number} the current time in milliseconds
   */
  getCurrentEngineTime = () => {
    return performance.now() - this.#debugMetrics.startTime;
  };

  // ****************************************************************
  // Private defs

  /**
   * Whether or not engine is paused
   *
   * @private
   * @type {Boolean}
   * @default false
   */
  #isPaused = false;

  /**
   * Whether or not engine has started
   *
   * @private
   * @type {Boolean}
   * @default false
   */
  #isStarted = false;

  /**
   * Relevant properties for debugging and performance logging. Composed primarily of either boolean flags or constant properties.
   *
   * @private
   * @type {Object}
   *
   * @property {Number} isPerformanceLoggingEnabled - whether Engine should log performance data to console or not
   * @property {Boolean} isPerformanceDebugScreenEnabled - whether Engine should draw performance metrics to canvas or not
   */
  #debugProperties = {
    isPerformanceDebugScreenEnabled: true,
    isPerformanceLoggingEnabled: false,
  };

  /**
   * Relevant properties for update cycle. Composed primarily of either boolean flags or constant properties.
   *
   * @private
   * @type {Object}
   *
   * @property {Number} maxFrameUpdates - maximum number of updates to perform between draw calls. If this number is exceeded, engine will panic and reset metrics.
   * @property {Number} targetFPS - target FPS for update loop to achieve during runtime
   * @property {Number} targetFrameTimestep - timestep of individual an individual frame in ms. Used as constant timestep for update method
   */
  #updateProperties = {
    maxFrameUpdates: 240,
    targetFPS: 60,
    targetFrameTimestep: 1000 / 60,
  };

  /**
   * Releveant metrics for debugging and performance tracking.
   *
   * @private
   * @type {Object}
   *
   * @property {Number} FPS - current FPS of engine
   * @property {Number} startTime - time at which Engine was started
   * @property {Number} updatesSinceStart - number of updates since Engine was started
   */
  #debugMetrics = {
    FPS: 0,
    startTime: 0,
    updatesSinceStart: 0,
  };

  /**
   * Relevant metrics for update cycle.
   *
   * @private
   * @type {Object}
   *
   * @property {Number} animationFrameID - ID of current animation frame
   * @property {Number} lag - accumulated lag time between updates in ms. Used to determine how many updates to perform in a single frame.
   * @property {Number} prevTimestamp - timestamp of last frame in ms
   */
  #updateMetrics = {
    animationFrameID: -1,
    lag: 0,
    prevTimestamp: 0,
  };

  /**
   * An array of actors to be updated and drawn by the canvas
   *
   * @type {Array<Actor>}
   */
  #actors = [];

  /**
   * An instance of EventHandler to handle events
   *
   * @type {EventHandler}
   */
  #eventHandler;

  /**
   * keeps track of FPS and updates all relevant actors
   *
   * @private
   * @param {DOMHighResTimeStamp} timestamp - timestamp of current frame
   *
   */
  #performGameLoopUpdates = (timestamp) => {
    this.#updateMetrics.animationFrameID = requestAnimationFrame(
      this.#performGameLoopUpdates
    );

    // *****************************
    // Calculate delta time and lag

    let dt = timestamp - this.#updateMetrics.prevTimestamp;
    this.#updateMetrics.prevTimestamp = timestamp;

    this.#updateMetrics.lag += dt;

    this.#debugMetrics.FPS = 1000 / dt;

    // *****************************
    // Perform engine updates based on current lag

    let numUpdates = 0;
    while (
      this.#updateMetrics.lag >= this.#updateProperties.targetFrameTimestep
    ) {
      this.#performEngineUpdates();

      this.#updateMetrics.lag -= this.#updateProperties.targetFrameTimestep;

      this.#debugMetrics.updatesSinceStart++;

      // if the number of updates exceeds the max number of updates allowed for a single frame, panic.
      if (++numUpdates >= this.#updateProperties.maxFrameUpdates) {
        this.#updateMetrics.lag = 0;
        break;
      }
    }

    // *****************************
    // Calculate interpolation and perform draw calls

    const interp =
      this.#updateMetrics.lag / this.#updateProperties.targetFrameTimestep;

    this.#performDrawCalls(interp);

    // *****************************
    // Post-update operations

    // filter actors array by those that are NOT queued for disposal
    this.#actors.filter((actor) => !actor.willDispose);
  };

  #performEngineUpdates = () => {
    if (this.#isPaused) return;

    // *****************************
    // actor update operations

    this.#actors.forEach((actor) => {
      actor.performUpdates(
        this.#updateProperties.targetFrameTimestep,
        this.environment
      );
    });

    // perform user-defined update callback (if provided)
    if (this.update)
      this.update(this.#updateProperties.targetFrameTimestep, this.environment);

    // get a list of current events in the queue
    const queuedEventTypes = this.#eventHandler.eventList.map(
      (event) => event.type
    );

    // get a list of all actors that currently have events that match queued events
    const relevantActors = this.#actors.filter((actor) =>
      actor.subscribedEvents.some((event) =>
        queuedEventTypes.includes(event.type)
      )
    );

    if (relevantActors.length > 0) {
      this.#eventHandler.eventList.forEach((event, i) => {
        const eventType = event.type;
        const eventPayload = event.payload;

        // loop through relevant actors, and perform event callbacks for each actor that has subscribed to the current event
        relevantActors.forEach((actor) => {
          actor.subscribedEvents.forEach((subscribedEvent) => {
            if (subscribedEvent.type === eventType) {
              subscribedEvent.callbacks[0](eventPayload);
            }
          });
        });
      });
    }

    // remove events labeled as non persistent from queue.
    this.#eventHandler.eventList = this.#eventHandler.eventList.filter(
      (event) => event.isPersistent
    );
  };

  /**
   * draws all relevant actors onto canvas
   *
   * @private
   * @param {CanvasRenderingContext2D} ctx - rendering context of canvas
   */
  #performDrawCalls = (interp) => {
    // *****************************
    // pre-draw operations

    if (this.#isPaused) return;

    // clear canvas
    this.ctx.clearRect(0, 0, this.environment.width, this.environment.height);

    // reset context fill color
    this.ctx.fillStyle = this.environment.background;
    this.ctx.fillRect(0, 0, this.environment.width, this.environment.height);

    // *****************************
    // primary draw operations

    this.#actors.forEach((actor) => actor.performDrawCalls(this.ctx, interp));

    // call user-defined draw callback (if provided)
    if (this.draw) this.draw(interp, this.ctx);

    // *****************************
    // post-draw operations

    if (this.#debugProperties.isPerformanceDebugScreenEnabled)
      this.#performDebugDrawCalls(interp);
  };

  #performDebugDrawCalls = (interp) => {
    this.ctx.fillStyle = "white";
    if (!isNaN(this.#debugMetrics.FPS)) {
      this.ctx.fillText("FPS: " + this.#debugMetrics.FPS, 5, 15);
      this.ctx.fillText("dt: " + 1000 / this.#debugMetrics.FPS, 5, 25);
      this.ctx.fillText("lag: " + this.#updateMetrics.lag, 5, 35);
      this.ctx.fillText("interp: " + interp, 5, 45);
      this.ctx.fillText(
        "total updates: " + this.#debugMetrics.updatesSinceStart,
        5,
        55
      );
      this.ctx.fillText(
        "runtime: " + (performance.now() - this.#debugMetrics.startTime) / 1000,
        5,
        65
      );
    }
  };

  /**
   * fixes DPI of canvas
   *
   * @private
   * @param {HTMLCanvasElement} canvasDOM - DOM element to recalculate DPI for
   * @returns {[number, number]} - [scaledWidth, scaledHeight]
   */
  #fixDPI = () => {
    const dpi = window.devicePixelRatio;

    // set current computed canvas dimensions
    const style_width = getComputedStyle(this.canvasDOM)
      .getPropertyValue("width")
      .slice(0, -2);
    const style_height = getComputedStyle(this.canvasDOM)
      .getPropertyValue("height")
      .slice(0, -2);

    // scale dimensions by DPI
    const w = style_width * dpi;
    const h = style_height * dpi;

    // set canvas element dimensions to scaled dimensions
    this.canvasDOM.setAttribute("width", w);
    this.canvasDOM.setAttribute("height", h);

    return [w, h];
  };
}
