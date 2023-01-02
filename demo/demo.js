// Character spritemap is an edited version of the original made by Buch: https://opengameart.org/users/buch

import Camera from "../src/core/camera";
import Engine from "../src/core/engine";
import Scene from "../src/core/scene";
import { vec } from "../src/math/vector";
import Actor from "../src/objects/actor";
import { TextureCache } from "../src/util/texture_cache";

import animationSpritemap from "./animationSpritemap.png";
import characterSpritemap from "./characterSpritemap.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

const camera = new Camera("camera", engine);

const scene = new Scene("SceneA", engine, camera);

const actorA = new Actor("actorA", scene, { pos: vec(250, engine.canvasSize.y / 2 - 32), size: vec(64, 64) });
const actorB = new Actor("actorB", scene, { pos: vec(250, engine.canvasSize.y / 2 + 150), size: vec(64, 64), vel: vec(1, 0) });

actorA.isDebugEnabled = true;
actorB.isDebugEnabled = true;

actorA.preload = async () => {
  const bitmap = await TextureCache.getInstance().load(animationSpritemap);

  console.log("Loaded bitmap: ", bitmap);

  actorA.addTexture("texmap", bitmap, vec(64, 64), 200);
  actorB.addTexture("texmap", bitmap, vec(64, 64), 200);

  actorA.textureID = "texmap";
  actorB.textureID = "texmap";
};

actorA.addListener("onkeydown", (e) => {
  if (e.key === "r") {
    actorA.vel = vec();
    actorA.setPosition(vec(250, engine.canvasSize.y / 2 - 32));
  }
});

actorA.addListener("whilekeydown", (e) => {
  if (e.key === "ArrowRight") actorA.vel.x += 0.01;
  if (e.key === "ArrowLeft") actorA.vel.x += -0.01;
  if (e.key === "ArrowUp") actorA.vel.y += -0.01;
  if (e.key === "ArrowDown") actorA.vel.y += 0.01;

  actorA.vel.x = Math.min(Math.max(actorA.vel.x, -0.5), 0.5);
  actorA.vel.y = Math.min(Math.max(actorA.vel.y, -0.5), 0.5);
});

actorA.addListener("ontick", (e) => {
  actorA.pos.x += actorA.vel.x * e.deltaTime;
  actorA.pos.y += actorA.vel.y * e.deltaTime;
});

actorB.addListener("ontick", (e) => {
  actorB.pos.x += actorB.vel.x * e.deltaTime;

  if (actorB.pos.x > engine.canvasSize.x + 64) {
    actorB.pos.x = 0;
  }
});

engine.start();
