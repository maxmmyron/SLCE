import { environment } from "../core/Engine";

/**
 * An actor function represents an actor that can be placed within the canvas.
 * @param {Function} draw a draw function that is called every frame
 * @param {Function} update an update function that is called every frame
 * @param {Object} options optional arguments for velocity and position
 */
const Actor = (drawCallback, updateCallback, options = {}) => {
  // utilize nullish coalescing operator to set default values
  // by checking if vel/pos values are null or undefined
  let vel = options.vel ?? { x: 0, y: 0 };
  let pos = options.pos ?? { x: 0, y: 0 };

  const draw = (ctx) => {
    drawCallback(ctx);
  }

  const update = () => {
    updateCallback();
    vel += environment.physics.accel;
  }
}

export default Actor