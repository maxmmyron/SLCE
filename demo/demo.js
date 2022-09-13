import Engine from "../src/core/Engine.js";
import { vec } from "../src/Math/Vector.js";
import Actor from "../src/Objects/Actor.js";
import TextureLayer from "../src/util/TextureLayer.js";
import test from "./testing.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

engine.environment.physics.accel.y = 0;

const numActors = 64;

[...Array(numActors)].forEach((_, i) => {
  const sqrtNumActors = Math.sqrt(numActors);

  const actor = new Actor({
    pos: vec(
      (engine.environment.width / sqrtNumActors) * (i % sqrtNumActors),
      (engine.environment.height / sqrtNumActors) *
        Math.floor(i / sqrtNumActors)
    ),
    vel: vec(),
    size: vec(64, 64),
    isDebugEnabled: true,
    isClippedToSize: i % 2 === 0,
  });

  actor.preload(async () => {
    actor.addTextureLayer(
      new TextureLayer(test, {
        isActive: true,
        size: vec(69, 69),
      })
    );
  });

  engine.addActor(actor);

  actor.addEventHandler("on_update", async (timestep, env) => {
    let textures = await actor.getTextures();

    if (textures.length > 0) {
      textures[0].pos.x = Math.cos(engine.getCurrentEngineTime() / 500) * 20;
      textures[0].pos.y = Math.sin(engine.getCurrentEngineTime() / 500) * 20;
      textures[0].size.x =
        Math.sin(engine.getCurrentEngineTime() / 500) * 20 + 69;
      textures[0].size.y =
        Math.cos(engine.getCurrentEngineTime() / 500) * 20 + 69;
    }
  });
});

engine.start();

setTimeout(() => {
  engine.pause();
}, 10000);
