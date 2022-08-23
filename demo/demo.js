import Engine from "../src/core/Engine.js";
import { add, sub, mult, vec } from "../src/Math/Vector.js";
import Actor from "../src/Objects/Actor.js";
import { encapsulateHandler } from "../src/util/EventHandler.js";
import TextureLayer from "../src/util/TextureLayer.js";
import test from "./testing.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

engine.environment.physics.accel.y = 3;

const actorA = new Actor({
  pos: vec(25, 50),
  textures: [new TextureLayer(test)],
});

actorA.eventHandler.addHandler("draw", (ctx) => {
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(actorA.pos.x, actorA.pos.y, 5, 0, Math.PI * 2, false);
  ctx.fill();
});

actorA.eventHandler.addHandler(
  "update",
  (dt) => {
    actorA.pos.x += 5 / dt;
  },
  {
    pos: vec(25, 50),
  }
);

actorA.preload(
  () => {
    const textureLayer = new TextureLayer(test, { pos: vec(100, 100) });
    actorA.addTextureLayer(textureLayer);
  },
  () => {
    engine.addActor(actorA);
  }
);

engine.start();

// const actorB = new Actor(
//   (ctx) => {
//     ctx.fillStyle = "#000000";
//     ctx.beginPath();
//     ctx.arc(actorB.pos.x, actorB.pos.y, 5, 0, Math.PI * 2, false);
//     ctx.fill();
//   },
//   (dt) => {
//     actorB.pos.y += actorB.vel.y / dt;
//     if(actorB.pos.y > engine.environment.height) {
//       actorB.pos.y = 0;
//     }
//   },
//   {
//     pos: vec(500,50),
//   }
// );

// engine.actors.push(actorB);

// const handlePause = () => console.log("paused");
// const handleResume = () => console.log("resumed");

// engine.addHandler("pause", handlePause)
// engine.addHandler("resume", handleResume)

// const handleUpdate = (dt) => {
//   console.log(dt);
// }

// engine.addHandler("update", handleUpdate);

// setTimeout(() => engine.pause(), 2500);
// setTimeout(() => engine.resume(), 3500);

// setTimeout(() => engine.pause(), 4500);
// setTimeout(() => engine.resume(), 5500);

// setTimeout(() => {
//   engine.removeHandler("pause", handlePause);
//   engine.removeHandler("resume", handleResume);
//   engine.removeHandler("update", handleUpdate);
// }, 6000);

// setTimeout(() => engine.pause(), 6500);
// setTimeout(() => engine.resume(), 7500);
