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
        accel: { x: 0, y: 0 }
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
   * Starts engine
   */
  start = () => {
    this.#fixDPI();
    this.#isPaused = false;
    this.#animationFrameID = requestAnimationFrame(this.#update);
  }

  /**
   * Pauses engine
   */
  pause = () => {
    cancelAnimationFrame(this.#animationFrameID);
    this.#isPaused = true;
  }

  /**
   * Gets state of isPaused property
   */
  get isPaused() {
    return this.#isPaused;
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
   */
  #isPaused = false;

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
   */
  #update = (timestamp) => {
    if (this.#isPaused) return;

    // calculate time between frames
    let dt = timestamp - this.#prevTimestamp;
    this.#prevTimestamp = timestamp;

    // calculate current FPS
    this.#debug.FPS = 1000 / dt;

    // call draw method to draw relevant actors
    this.#draw(this.ctx);

    // update relevant actors
    this.actors.forEach(actor => actor.update(dt, this.environment));

    // filter actors array by those that are NOT queued for disposal
    this.actors.filter(actor => !actor.disposalQueued);

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

    this.actors.forEach(actor => actor.draw(this.ctx));

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