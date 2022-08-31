import Engine from "../src/core/Engine.js";
import { add, sub, mult, vec } from "../src/Math/Vector.js";
import Actor from "../src/Objects/Actor.js";
import TextureLayer from "../src/util/TextureLayer.js";
import test from "./testing.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

engine.environment.physics.accel.y = 0;

new Array(9).fill(0).forEach((_, i) => {
  const actor = new Actor({
    position: vec(48, i * 64 + 48),
    velocity: vec(i + 1, 0),
  });

  actor.eventHandler.addHandler("draw", (ctx) => {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(actor.position.x, actor.position.y, 5, 0, Math.PI * 2, false);
    ctx.fill();
  });

  actor.eventHandler.addHandler("update", (dt) => {
    actor.position.x += actor.velocity.x;
    if (actor.position.x - 24 > engine.environment.width) {
      actor.position.x = -24;
    }
  });

  actor.preload(
    () => {
      const textureLayer = new TextureLayer(test);
      actor.addTextureLayer(textureLayer);
    },
    () => engine.addActor(actor)
  );
});

new Array(9).fill(0).forEach((_, i) => {
  const actor = new Actor({
    position: vec(i * 64 + 48, 48),
    velocity: vec(0, i + 1),
  });

  actor.eventHandler.addHandler("draw", (ctx) => {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(actor.position.x, actor.position.y, 5, 0, Math.PI * 2, false);
    ctx.fill();
  });

  actor.eventHandler.addHandler("update", (dt) => {
    actor.position.y += actor.velocity.y;
    if (actor.position.y - 24 > engine.environment.height) {
      actor.position.y = -24;
    }
  });

  actor.preload(
    () => {
      const textureLayer = new TextureLayer(test);
      actor.addTextureLayer(textureLayer);
    },
    () => engine.addActor(actor)
  );
});

engine.start();

setTimeout(() => {
  engine.pause();
}, 10000);
