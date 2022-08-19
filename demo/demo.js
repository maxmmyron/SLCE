import Engine from "../src/core/Engine.js";
import Actor from "../src/Objects/Actor.js";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

engine.environment.physics.accel.y = 3;

const actorA = new Actor(
  (ctx) => {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(actorA.pos.x, actorA.pos.y, 5, 0, Math.PI * 2, false);
    ctx.fill();
  },
  (dt) => {
    actorA.pos.x += 5 / dt;
  },
  {
    pos: { x: 25, y: 50 },
  }
);

const actorB = new Actor(
  (ctx) => {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(actorB.pos.x, actorB.pos.y, 5, 0, Math.PI * 2, false);
    ctx.fill();
  },
  (dt) => {
    actorB.pos.y += actorB.vel.y / dt;
    if(actorB.pos.y > engine.environment.height) {
      actorB.pos.y = 0;
    }
  },
  {
    pos: { x: 500, y: 50 },
  }
);

engine.actors.push(actorA);
engine.actors.push(actorB);

engine.start();

setTimeout(() => engine.isPaused = true, 2500);
setTimeout(() => engine.isPaused = false, 3500);
