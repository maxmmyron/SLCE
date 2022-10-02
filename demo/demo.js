import Engine from "../src/core/Engine.js";
import { vec } from "../src/Math/Vector.js";
import Actor from "../src/Objects/Actor.js";
import TextureLayer from "../src/util/TextureLayer.js";

import grassTexturePath from "./grassTexture.png";
import dirtTexturePath from "./dirtTexture.png";

import testingTexturePath from "./testTexture.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

const ground = new Actor({
  pos: vec(0, engine.environment.height - 200),
  size: vec(engine.environment.width, 500),
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

let pX = 0;

const player = new Actor({
  pos: vec(300, engine.environment.height - 200 - 48),
  size: vec(48, 48),
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

player.subscribe("keydown", (e) => {
  console.log(e);
  if (e.key === "ArrowRight") {
    console.log("right");
    player.vel.x = 5;
  } else if (e.key === "ArrowLeft") {
    console.log("left");
    player.vel.x = -5;
  }
});

player.update = (dt, env) => {
  player.vel.x *= 0.9;
  player.pos.x += player.vel.x;
};

engine.addActor(player);

engine.start();
