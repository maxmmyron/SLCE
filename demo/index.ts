/// <reference types="vite/client" />

// Character spritemap is an edited version of the original made by Buch: https://opengameart.org/users/buch

import Camera from "@/core/Camera";
import Engine from "@/core/Engine";
import Scene from "@/elements/scene";
import Vector2D from "@/math/vector2d";
import Actor from "@/elements/actor";
import { TextureCache } from "@/util/texture_cache";

import characterSpritemap from "./characterSpritemap.png";

const canvas = document.getElementById("c");
const engine = new Engine(<HTMLCanvasElement>canvas, { isDebugEnabled: false });

const camera = new Camera("camera", engine, { position: new Vector2D(50, 50), zoom: 1 });

const scene = new Scene("SceneA", engine, camera, { position: new Vector2D(10, 10), size: new Vector2D(1000, 1000), background: "#110022" });

const actorA = new Actor("actorA", scene, { position: new Vector2D(150, 150), size: new Vector2D(64, 64), isDebugEnabled: true });

actorA.preload = async () => {
  const bitmap = await TextureCache.getInstance().load(characterSpritemap);
  actorA.addTexture("texmap", bitmap, new Vector2D(32, 32), 200);
  actorA.textureID = "texmap";
};

actorA.addListener("onkeydown", (e) => {
  if (e.key === "r") {
    actorA.velocity = new Vector2D();
    actorA.setPosition(new Vector2D(250, engine.canvasSize.y / 2 - 32));
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
  actorA.velocity = actorA.velocity.multiply(0.99);

  actorA.position = actorA.position.add(actorA.velocity.multiply(e.deltaTime));
});

camera.addListener("whilekeydown", (e) => {
  if (e.key === "d") camera.velocity.x = 0.4
  if (e.key === "a") camera.velocity.x = -0.4
  if (e.key === "w") camera.velocity.y = -0.4
  if (e.key === "s") camera.velocity.y = 0.4
});

camera.addListener("ontick", (e) => {
  camera.velocity = camera.velocity.multiply(0.96);
  camera.position = camera.position.add(camera.velocity.multiply(e.deltaTime));

  console.log("a", engine.engineRuntimeMilliseconds);
});

engine.addListener("ontick", (e) => {
  console.log(actorA.position.toString());
})

engine.start();
