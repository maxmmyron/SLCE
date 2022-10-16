import Engine from "../src/core/Engine";
import { vec } from "../src/math/Vector";
import Actor from "../src/objects/Actor";

import animationSpritemap from "./animationSpritemap.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

const ground = new Actor({
  pos: vec(0, engine.environment.properties.size.y - 200),
  size: vec(engine.environment.properties.size.x, 500),
  isDebugEnabled: true,
});

engine.addActor(ground);

const player = new Actor({
  pos: vec(300, engine.environment.properties.size.y - 200 - 48),
  size: vec(48, 48),
  isDebugEnabled: true,
});

player.preload(async () => {
  player.loadTexture("animation", animationSpritemap, {
    frameCount: 64,
    spriteSize: vec(64, 64),
  });
});

console.log(player.textureManager.textures);

player.addAnimationState("idle", "animation", {
  frameCount: 64,
  startIndex: 0,
  frameDuration: 200,
});

player.setAnimationState("idle");

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
