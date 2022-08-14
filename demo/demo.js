import Engine from "../src/core/Engine.js";
import Actor from "../src/Objects/Actor.js";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

const actor = Actor(
  (ctx) => {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2, false);
    ctx.fill();
  },
  (dt) => {
    pos.x += 5 * dt;
  }
);

engine.actors.push(actor);

engine.start();

setTimeout(() => engine.pause(), 2500);
