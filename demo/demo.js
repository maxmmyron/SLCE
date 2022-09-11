import Engine from "../src/core/Engine.js";
import { vec } from "../src/Math/Vector.js";
import Actor from "../src/Objects/Actor.js";
import TextureLayer from "../src/util/TextureLayer.js";
import test from "./testing.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

engine.environment.physics.accel.y = 0;

const actor = new Actor({
  pos: vec(engine.environment.width / 2, engine.environment.height / 2),
  vel: vec(),
  size: vec(64, 64),
});

actor.addEventHandler("on_draw", (ctx) => {
  ctx.fillStyle = "black";
  ctx.fillRect(
    actor.pos.x - actor.size.x / 2,
    actor.pos.y - actor.size.y / 2,
    actor.size.x,
    actor.size.y
  );
});

engine.addActor(actor);

engine.start();

setTimeout(() => {
  engine.pause();
}, 10000);
