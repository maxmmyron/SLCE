import Engine from "../src/core/Engine.js";
import { vec } from "../src/Math/Vector.js";
import Actor from "../src/Objects/Actor.js";
import TextureLayer from "../src/util/TextureLayer.js";
import test from "./testing.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

engine.environment.physics.accel.y = 0;

const actor = new Actor({
  pos: vec(
    engine.environment.width / 2 - 32,
    engine.environment.height / 2 - 32
  ),
  vel: vec(),
  size: vec(64, 64),
  isDebugEnabled: true,
});

actor.preload(
  () => {
    actor.addTextureLayer(
      new TextureLayer(test, { isActive: true, size: vec(69, 69) })
    );
  },
  () => {
    engine.addActor(actor);
  }
);

engine.start();

console.log(engine.getActors());

setTimeout(() => {
  engine.pause();
}, 10000);
