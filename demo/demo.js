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
    pos: vec(48, i * 64 + 48),
    vel: vec((i + 1) * 1.1, 0),
  });

  actor.eventHandler.addHandler("draw", (ctx) => {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(actor.pos.x, actor.pos.y, 5, 0, Math.PI * 2, false);
    ctx.fill();
  });

  actor.eventHandler.addHandler(
    "update",
    (dt) => {
      actor.pos.x += actor.vel.x;
      if (actor.pos.x - 24 > engine.environment.width) {
        actor.pos.x = -24;
      }
    },
    {
      pos: vec(25, 50),
    }
  );

  actor.preload(
    () => {
      const textureLayer = new TextureLayer(test);
      actor.addTextureLayer(textureLayer);
    },
    () => engine.addActor(actor)
  );
});

new Array(16).fill(0).forEach((_, i) => {
  const actor = new Actor({
    pos: vec(i * 64 + 48, 48),
    vel: vec(0, (i + 1) * 1.1),
  });

  actor.eventHandler.addHandler("draw", (ctx) => {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(actor.pos.x, actor.pos.y, 5, 0, Math.PI * 2, false);
    ctx.fill();
  });

  actor.eventHandler.addHandler("update", (dt) => {
    actor.pos.y += actor.vel.y;
    if (actor.pos.y - 24 > engine.environment.height) {
      actor.pos.y = -24;
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
