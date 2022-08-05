import Engine, { actors } from "../src/core/Engine";
import Actor from "../src/Objects/Actor";

const engine = new Engine();

const actor = new Actor(
  (ctx) => {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2, false);
    ctx.fill();
  },
  () => {
    pos.x += 5;
  }
);

actors.push(actor);

engine.start();

setTimeout(() => engine.pause(), 2500);
