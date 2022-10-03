import Engine from "../src/core/Engine.js";
import { vec } from "../src/math/Vector.js";
import Actor from "../src/objects/Actor.js";
import TextureLayer from "../src/util/TextureLayer.js";

import grassTexturePath from "./grassTexture.png";
import dirtTexturePath from "./dirtTexture.png";

import testingTexturePath from "./testTexture.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

const ground = new Actor({
  pos: vec(0, engine.environment.properties.size.y - 200),
  size: vec(engine.environment.properties.size.x, 500),
  isDebugEnabled: true,
});

ground.preload(async () => {
  ground.addTextureLayer(
    new TextureLayer(testingTexturePath, {
      isActive: true,
      size: vec(64, 64),
      tileMode: "tile",
      zIndex: 0,
    })
  );
});

engine.addActor(ground);

const player = new Actor({
  pos: vec(300, engine.environment.properties.size.y - 200 - 48),
  size: vec(48, 48),
  isDebugEnabled: true,
});

player.preload(async () => {
  player.addTextureLayer(
    new TextureLayer(testingTexturePath, {
      isActive: true,
      size: vec(48, 48),
      zIndex: 1,
    })
  );
});

player.subscribe("whilekeydown", (e) => {
  if (e.key === "ArrowRight") {
    player.vel.x = 5;
  } else if (e.key === "ArrowLeft") {
    player.vel.x = -5;
  }
});

player.update = (dt, env) => {
  player.vel.x *= 0.85;
  player.pos.x += player.vel.x;
};

engine.addActor(player);

engine.start();
