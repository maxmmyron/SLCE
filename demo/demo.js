// Character spritemap is an edited version of the original made by Buch: https://opengameart.org/users/buch

import Camera from "../src/core/camera";
import Engine from "../src/core/engine";
import Scene from "../src/elements/scene";
import { vec, mult } from "../src/math/vector";
import Actor from "../src/elements/actor";
import { TextureCache } from "../src/util/texture_cache";

import animationSpritemap from "./animationSpritemap.png";
import characterSpritemap from "./characterSpritemap.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas, { isDebugEnabled: true });

const camera = new Camera("camera", engine, { position: vec(50, 50) });

const scene = new Scene("SceneA", engine, camera, { position: vec(10, 10), size: vec(1000, 1000), background: "#110022" });

const actorA = new Actor("actorA", scene, { position: vec(150, 150), size: vec(64, 64), isDebugEnabled: true });

actorA.preload = async () => {
  const bitmap = await TextureCache.getInstance().load(characterSpritemap);
  actorA.addTexture("texmap", bitmap, vec(32, 32), 200);
  actorA.textureID = "texmap";
};

actorA.addListener("onkeydown", (e) => {
  if (e.key === "r") {
    actorA.velocity = vec();
    actorA.setPosition(vec(250, engine.canvasSize.y / 2 - 32));
  }
});

actorA.addListener("whilekeydown", (e) => {
  if (e.key === "ArrowRight") actorA.velocity.x += 0.01;
  if (e.key === "ArrowLeft") actorA.velocity.x += -0.01;
  if (e.key === "ArrowUp") actorA.velocity.y += -0.01;
  if (e.key === "ArrowDown") actorA.velocity.y += 0.01;

  actorA.velocity.x = Math.min(Math.max(actorA.velocity.x, -0.5), 0.5);
  actorA.velocity.y = Math.min(Math.max(actorA.velocity.y, -0.5), 0.5);
});

actorA.addListener("ontick", (e) => {
  actorA.velocity = mult(actorA.velocity, 0.99)

  actorA.position.x += actorA.velocity.x * e.deltaTime;
  actorA.position.y += actorA.velocity.y * e.deltaTime;
});

camera.addListener("whilekeydown", (e) => {
  if (e.key === "d") camera.velocity.x = 0.4
  if (e.key === "a") camera.velocity.x = -0.4
  if (e.key === "w") camera.velocity.y = -0.4
  if (e.key === "s") camera.velocity.y = 0.4
});

camera.addListener("ontick", (e) => {
  camera.velocity = mult(camera.velocity, 0.96);

  camera.position.x += camera.velocity.x * e.deltaTime;
  camera.position.y += camera.velocity.y * e.deltaTime;
});

engine.start();
