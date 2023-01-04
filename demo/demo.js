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
const engine = new Engine(canvas);

const camera = new Camera("camera", engine);

const scene = new Scene("SceneA", engine, camera, { position: vec(10, 10), size: vec(500, 500) }, { background: "#110022" });

const actorA = new Actor("actorA", scene, { position: vec(150, 150), size: vec(64, 64) });
const actorB = new Actor("actorB", scene, { position: vec(-200, 450), size: vec(64, 64), velocity: vec(0.1, 0) });

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

actorB.addListener("ontick", (e) => {
  actorB.position.x += actorB.velocity.x * e.deltaTime;

  if (actorB.position.x > scene.size.x) {
    actorB.position.x = -250;
  }
});

scene.addListener("ontick", (e) => {
  scene.position.x += 0.1 * e.deltaTime;

  if (scene.position.x > 500) scene.position.x = 10;
});

engine.start();
