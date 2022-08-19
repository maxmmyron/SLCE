import Engine from "../src/core/Engine.js";
import { vec } from "../src/Math/Vector.js";
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
    pos: vec(25,50),
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
    pos: vec(500,50),
  }
);

engine.actors.push(actorA);
engine.actors.push(actorB);

const handlePause = () => console.log("paused");
const handleResume = () => console.log("resumed");

engine.addHandler("pause", handlePause)
engine.addHandler("resume", handleResume)

const handleUpdate = (dt) => {
  console.log(dt);
}

engine.addHandler("update", handleUpdate);

engine.start();

setTimeout(() => engine.pause(), 2500);
setTimeout(() => engine.resume(), 3500);

setTimeout(() => engine.pause(), 4500);
setTimeout(() => engine.resume(), 5500);

setTimeout(() => {
  engine.removeHandler("pause", handlePause);
  engine.removeHandler("resume", handleResume);
  engine.removeHandler("update", handleUpdate);
}, 6000);

setTimeout(() => engine.pause(), 6500);
setTimeout(() => engine.resume(), 7500);
