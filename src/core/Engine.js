/**
 * An array of actors to be updated and drawn by the canvas
 */
let actors = [];

/**
 * A struct of global variables.
 */
let environment = {
  background: "#ffffff",
  width: Math.ceil(getComputedStyle(canvasDOM).getPropertyValue("width").slice(0, -2)),
  height: Math.ceil(getComputedStyle(canvasDOM).getPropertyValue("height").slice(0, -2)),
  physics: {
    accel: {x: 0, y: 5}
  }
}

/**
 * A struct of debug variables.
 */
let debug = {
  FPS: 0,
  _drawFPS: true,
}

/**
 * Engine for handling game update logic and actor drawing.
 * @param {HTMLCanvasElement} canvasDOM canvas on which to draw to
 * @param {Object} options optional arguments
 */
const Engine = (canvasDOM, options = {}) => {
  // ensure canvasDOM is valid canvas DOM element
  if (!(canvasDOM instanceof HTMLCanvasElement)) {
    throw new Error('canvasDOM must be a valid canvas DOM element');
  }

  const ctx = canvasDOM.getContext('2d');

  // listen for resize events and update canvas dimensions
  document.addEventListener("resize", e => {
    dimensions = fixDPI(canvasDOM);
    // set canvas width and height to scaled width and height
    environment.width = dimensions[0];
    environment.height = dimensions[1];
  });

  /**
   * Starts engine
   */
  const start = () => {
    fix_dpi();
    requestAnimationFrame(update);
  }

  /**
   * Pauses engine
   */
  const pause = () => {
    cancelAnimationFrame(update);
  }
}

// Internal functions

let lastTime = 0;
/**
 * (internal function) keeps track of FPS and updates all relevant actors
 * @param {Number} timestamp timestamp of current frame
 */
const update = (timestamp) => {
  // get current FPS
  let dT = timestamp - lastTime;
  lastTime = timestamp;
  debug.FPS = 1000 / dT;

  // draw all relevant actors
  draw(ctx);

  // update actors
  actors.forEach(actor => actor.update(dT));

  // filter actors array by those that are NOT queued for disposal
  actors.filter(actor => !actor.disposalQueued);

  requestAnimationFrame(update);
}

/**
 * (internal function) draws all relevant actors onto canvas
 * @param {CanvasRenderingContext2D} ctx rendering context of canvas
 */
const draw = (ctx) => {
  // clear canvas
  ctx.clearRect(0, 0, environment.width, environment.height);
  // reset context fill color
  ctx.fillStyle = environment.background;
  ctx.fillRect(0, 0, environemnt.width, environment.height);

  actors.forEach(actor => actor.draw(ctx));

  if (debug._showFPS) {
    ctx.fillStyle = "#000000"; // TODO: remove magic number (i.e. dynamically set color to opposite of background color)
    if (!isNaN(debug.FPS))
      ctx.fillText("FPS: " + Math.round(debug.FPS), 5, 15);
  }
}

/**
 * (internal function) fixes DPI of canvas
 * @param {HTMLCanvasElement} canvasDOM DOM element to recalculate DPI for
 * @returns {[number, number]} [scaledWidth, scaledHeight]
 */
const fixDPI = (canvasDOM) => {
  let dpi = window.devicePixelRatio;

  // set current computed canvas dimensions
  var style_width = getComputedStyle(canvasDOM).getPropertyValue("width").slice(0, -2); //get width attribute
  var style_height = getComputedStyle(canvasDOM).getPropertyValue("height").slice(0, -2); //get height attribute

  // scale dimensions by DPI
  var w = style_width * dpi;
  var h = style_height * dpi;

  // set canvas element dimensions to scaled dimensions
  canvasDOM.setAttribute('width', w);
  canvasDOM.setAttribute('height', h);

  return [w, h];
}

export default Engine
export { actors, environment };