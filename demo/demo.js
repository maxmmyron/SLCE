import Engine from "../src/core/Engine.js";
import { vec } from "../src/Math/Vector.js";
import Actor from "../src/Objects/Actor.js";
import TextureLayer from "../src/util/TextureLayer.js";
import test from "./testing.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

engine.environment.physics.accel.y = 0;

const actorA = new Actor({
  pos: vec(engine.environment.width / 2 - 64, engine.environment.height / 2),
  vel: vec(),
  bounds: {
    pos: vec(-16, -16),
    size: vec(32),
  },
});

actorA.eventHandler.addHandler("draw", (ctx) => {
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(actorA.pos.x, actorA.pos.y, 25, 0, Math.PI * 2, false);
  ctx.clip();
});

engine.start();

setTimeout(() => {
  engine.pause();
}, 10000);
