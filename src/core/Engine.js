import { vec } from "../Math/Vector";
import EventHandler from "../util/EventHandler";
import Actor from "../Objects/Actor";

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
      background: "#ffffff",
      width: getComputedStyle(canvasDOM).getPropertyValue("width").slice(0, -2),
      height: getComputedStyle(canvasDOM).getPropertyValue("height").slice(0, -2),
      physics: {
        accel: vec()
      }
    }

    this.eventHandler = new EventHandler(["update", "pause", "resume"]);

    // listen for resize events and update canvas size
    document.addEventListener("resize", e => {
      dimensions = this.#fixDPI();
      // set canvas width and height to scaled width and height
      this.environment.width = dimensions[0];
      this.environment.height = dimensions[1];
    });
    this.#fixDPI();
  }

  // ****************************************************************
  // Public defs

  /**
    * An EventHandler object for handling engine events
    * 
    * @private
    * @type {EventHandler}
    */
  eventHandler;

  /**
   * Returns whether engine is paused or not
   * 
   * @return {Boolean} true if engine is paused, false otherwise
   */
  isPaused = () => this.#isPaused;

  /**
   * Pauses engine update loop. Game will continue requesting 
   * animation frames, but will not continue to update or draw.
   */
  pause = () => {
    this.#isPaused = true;
    this.eventHandler.eventHandlers["pause"].forEach(handler => handler());
  }

  /**
   * Resumes engine update loop.
   */
  resume = () => {
    this.#isPaused = false;
    this.eventHandler.eventHandlers["resume"].forEach(handler => handler());
  }

  /**
   * Starts engine update loop. Used only once at startup.
   */
  start = () => {
    if (!this.#hasStart) {
      this.#fixDPI();
      this.#animationFrameID = requestAnimationFrame(this.#update);
      this.#hasStart = true;
    } else {
      throw new Error(`Error starting engine: engine has already started.`);
    }
  }

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
      throw new Error(`Error adding actor: actor must be an instance of Actor.`);
    }

    this.#actors.push(actor);
  }

  /**
   * Queues an actor for disposal by setting actor's disposalQueued flag to true.
   * 
   * @param {Actor} actor 
   * @return {Boolean} true if actor was queued for disposal
   * 
   * @throws {Error} if actor is not an instance of Actor
   */
  removeActor = (actor) => {
    if (!(actor instanceof Actor)) {
      throw new Error(`Error removing actor: actor must be an instance of Actor.`);
    }

    // queue actor for disposal instead of removing immediately
    // this prevents actors from being removed from the array while iterating over it
    actor.disposalQueued = true;
    return true;
  }

  /**
   * Returns an array of current actors in engine
   * 
   * @returns {Array} an array of all actors in the engine
   */
  getActors = () => this.#actors;

  // ****************************************************************
  // Private defs

  /**
   * An array of actors to be updated and drawn by the canvas
   * 
   * @type {Array<Actor>}
   */
  #actors = [];

  /**
   * Struct for storing useful debug values
   * 
   * @private
   * @type {Object}
   * @property {Number} debug.fps - current FPS
   * @property {Boolean} debug.showFPS - whether to show FPS
   * @property {Boolean} debug.logPerformanceMetrics - whether to log performance metrics
   */
  #debug = {
    FPS: 0,
    showFPS: true,
    logPerformanceMetrics: true
  };

  /**
   * Timestamp of last frame. Used to calculate delta time in update method
   * 
   * @private
   * @type {number}
   */
  #prevTimestamp = 0;

  /**
   * holds ID of animation frame request
   * 
   * @private
   * @type {Number}
   */
  #animationFrameID = 0;

  /**
   * Stores whether Engine is paused or not
   * 
   * @private
   * @type {Boolean}
   * @default false
   */
  #isPaused = false;

  /**
   * Stores whether Engine has been started or not
   * 
   * @private
   * @type {Boolean}
   * @default false
   */
  #hasStart = false;

  /**
   * keeps track of FPS and updates all relevant actors
   * 
   * @private
   * @param {DOMHighResTimeStamp} timestamp - timestamp of current frame
   */
  #update = (timestamp) => {
    if (!this.#isPaused) {

      // calculate time between frames
      let dt = timestamp - this.#prevTimestamp;
      this.#prevTimestamp = timestamp;

      this.#debug.FPS = 1000 / dt;

      // call draw method to draw relevant actors
      this.#draw(this.ctx);

      // update relevant actors
      this.#actors.forEach(actor => actor.update(dt, this.environment));

      // call event handlers for relevant events
      this.eventHandler.eventHandlers["update"].forEach(handler => handler(dt, this.environment));

      // filter actors array by those that are NOT queued for disposal
      this.#actors.filter(actor => !actor.disposalQueued);
    }

    this.#animationFrameID = requestAnimationFrame(this.#update);
  }

  /**
   * draws all relevant actors onto canvas
   * 
   * @private
   * @param {CanvasRenderingContext2D} ctx - rendering context of canvas
   */
  #draw = () => {
    // clear canvas
    this.ctx.clearRect(0, 0, this.environment.width, this.environment.height);
    // reset context fill color
    this.ctx.fillStyle = this.environment.background;
    this.ctx.fillRect(0, 0, this.environment.width, this.environment.height);

    this.#actors.forEach(actor => actor.draw(this.ctx));

    // Draw FPS on screen, if enabled
    if (this.#debug.showFPS) {
      this.ctx.fillStyle = "#333333"; // TODO: remove magic number (i.e. dynamically set color to opposite of background color)
      if (!isNaN(this.#debug.FPS)) {
        this.ctx.fillText("FPS: " + Math.round(this.#debug.FPS), 5, 15);
        this.ctx.fillText("dt: " + (1000 / this.#debug.FPS), 5, 25);
      }
    }
  }

  /**
   * fixes DPI of canvas
   * 
   * @private
   * @param {HTMLCanvasElement} canvasDOM - DOM element to recalculate DPI for
   * @returns {[number, number]} - [scaledWidth, scaledHeight]
   */
  #fixDPI = () => {
    let dpi = window.devicePixelRatio;

    // set current computed canvas dimensions
    var style_width = getComputedStyle(this.canvasDOM).getPropertyValue("width").slice(0, -2); //get width attribute
    var style_height = getComputedStyle(this.canvasDOM).getPropertyValue("height").slice(0, -2); //get height attribute

    // scale dimensions by DPI
    var w = style_width * dpi;
    var h = style_height * dpi;

    // set canvas element dimensions to scaled dimensions
    this.canvasDOM.setAttribute('width', w);
    this.canvasDOM.setAttribute('height', h);

    return [w, h];
  }
}