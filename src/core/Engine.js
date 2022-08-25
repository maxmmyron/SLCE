import { vec } from "../Math/Vector";

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

    this.#init(); // call first time init to set up canvas
  }

  // ****************************************************************
  // Public defs

  /**
   * An array of actors to be updated and drawn by the canvas
   */
  actors = [];

  /**
   * Starts engine update loop. Used only once at startup.
   */
  start = () => {
    if (!this.#hasInit) {
      this.#fixDPI();
      this.#animationFrameID = requestAnimationFrame(this.#update);
      this.#hasInit = true;
    }
  }

  /**
   * Pauses engine update loop. Game will continue requesting 
   * animation frames, but will not continue to update or draw.
   */
  pause = () => {
    this.#isPaused = true;
    this.#eventHandlers["pause"].forEach(handler => handler());
  }

  /**
   * Resumes engine update loop.
   */
  resume = () => {
    this.#isPaused = false;
    this.#eventHandlers["resume"].forEach(handler => handler());
  }

  /**
   * Returns whether engine is paused or not
   * 
   * @return {Boolean} true if engine is paused, false otherwise
   */
  isPaused = () => this.#isPaused;

  /**
   * Adds a handler function to execute on a specific event.
   * @param {String} event - name of event to handle
   * @param {Function} handler - function to execute when event is triggered
   * 
   * @throws {Error} if event is not a string
   * @throws {Error} if handler is not a function
   * @throws {Error} if event is not a valid event
   */
  addHandler = (event, handler) => {
    // assert event is a string
    if (typeof event !== "string") throw new Error("event must be a string");
    // assert handler is a function
    if (typeof handler !== "function") throw new Error("handler must be a function");
    // assert event is a valid event
    if (!this.#validEvents.includes(event)) throw new Error("event is not a valid event");

    // add handler function to array of handlers for specified event
    this.#eventHandlers[event].push(handler);
  }

  /**
   * Removes handler fucntion from event
   * 
   * @param {String} event - name of event to remove handler from
   * @param {Function} handler - function to remove from event
   * @return {Boolean} true if handler was removed, false otherwise
   * 
   * @throws {Error} if event is not a string
   * @throws {Error} if handler is not a function
   * @throws {Error} if event is not a valid event
   */
  removeHandler = (event, handler) => {
    // assert event is a string
    if (typeof event !== "string") throw new Error("event must be a string");
    // assert handler is a function
    if (typeof handler !== "function") throw new Error("handler must be a function");
    // assert event is a valid event
    if (!this.#validEvents.includes(event)) throw new Error("event is not a valid event");

    // remove handler function from array of handlers for specified event
    const index = this.#eventHandlers[event].indexOf(handler);
    if (index !== -1) {
      this.#eventHandlers[event].splice(index, 1);
      return true;
    }
    return false;
  }


  // ****************************************************************
  // Private defs

  /**
   * Struct for storing useful debug values
   * 
   * @private
   * @type {Object}
   * @property {Number} fps - current frames per second.
   * @property {Boolean} showFPS - whether to show FPS
   * 
   */
  #debug = {
    FPS: 0,
    showFPS: true,
  };

  /**
   * Timestamp of last frame. Used to calculate delta time in update method
   * 
   * @private
   * @type {Number}
   */
  #prevTimestamp = 0;

  /**
   * Accumulating lag for update method. Used to smooth out update method.
   * 
   * @private
   * @type {Number}
   */
  #lag = 0;

  /**
   * Target FPS to reach when updating
   * 
   * @private
   * @type {Number}
   * @default 60
   */
  #targetFPS = 60;

  /**
   * Target frame rate (in ms) to reach when updating. 
   * Used as contstant timestep for update methods
   * 
   * @private
   * @type {Number}
   */
  #targetFrameTime = 1000 / this.#targetFPS;

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
   * Stores whether Engine has been initialized or not
   * 
   * @private
   * @type {Boolean}
   * @default false
   */
  #hasInit = false;

  /**
   * Enum of possible event types to be handled
   * 
   * @private
   * @type {Array}
   * 
   * @property {String} update - triggered on each engine update loop
   * @property {String} pause - triggered on engine pause
   * @property {String} resume - triggered on engine resume
   */
  #validEvents = ["update", "pause", "resume"];

  /**
   * Array of event handlers for each event type
   *
   * @private
   * @type {Object}
   * 
   * @property {Array} update - array of update event handlers
   * @property {Array} pause - array of pause event handlers
   * @property {Array} resume - array of resume event handlers
   */

  #eventHandlers = {
    update: [],
    pause: [],
    resume: [],
  };

  /**
   * Initializes canvas and sets up event listeners
   * 
   * @private
   */
  #init = () => {
    // listen for resize events and update canvas size
    document.addEventListener("resize", e => {
      dimensions = this.#fixDPI();
      // set canvas width and height to scaled width and height
      this.environment.width = dimensions[0];
      this.environment.height = dimensions[1];
    });
    this.#fixDPI();
  }

  /**
   * keeps track of FPS and updates all relevant actors
   * 
   * @private
   * @param {DOMHighResTimeStamp} timestamp - timestamp of current frame
   * 
   * todo: https://isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing#first-attempt
   */
  #update = (timestamp) => {
    if (!this.#isPaused) {

      // calculate time between frames
      let dt = timestamp - this.#prevTimestamp;
      this.#prevTimestamp = timestamp;

      this.#lag += dt;

      // calculate current FPS
      this.#debug.FPS = 1000 / dt;

      while(this.#lag >= this.#targetFrameTime) {
        // call event handlers for relevant events
        this.#eventHandlers["update"].forEach(handler => handler(this.#targetFrameTime, this.environment));

        // update all actors
        this.actors.forEach(actor => actor.update(this.#targetFrameTime, this.environment));

        this.#lag -= this.#targetFrameTime;
      }

      // interpolate between lag and target frame time
      const interp = this.#lag / this.#targetFrameTime;

      // call draw method to draw relevant actors
      this.#draw(interp);

      // filter actors array by those that are NOT queued for disposal
      this.actors.filter(actor => !actor.disposalQueued);
    }

    this.#animationFrameID = requestAnimationFrame(this.#update);
  }

  /**
   * draws all relevant actors onto canvas
   * 
   * @private
   * @param {CanvasRenderingContext2D} ctx - rendering context of canvas
   */
  #draw = (interp) => {
    // clear canvas
    this.ctx.clearRect(0, 0, this.environment.width, this.environment.height);
    // reset context fill color
    this.ctx.fillStyle = this.environment.background;
    this.ctx.fillRect(0, 0, this.environment.width, this.environment.height);

    this.actors.forEach(actor => actor.draw(this.ctx, interp));

    // Draw FPS on screen, if enabled
    if (this.#debug.showFPS) {
      this.ctx.fillStyle = "#333333"; // TODO: remove magic number (i.e. dynamically set color to opposite of background color)
      if (!isNaN(this.#debug.FPS)) {
        this.ctx.fillText("FPS: " + Math.round(this.#debug.FPS), 5, 15);
        this.ctx.fillText("dt: " + (1000 / this.#debug.FPS), 5, 25);
        this.ctx.fillText("lag: " + this.#lag, 5, 35);
        this.ctx.fillText("interp: " + interp, 5, 45);
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