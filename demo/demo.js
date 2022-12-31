// Character spritemap is an edited version of the original made by Buch: https://opengameart.org/users/buch

import { Camera } from "../src/core/camera";
import Engine from "../src/core/engine";
import { Scene } from "../src/core/scene";
import { vec } from "../src/math/vector";
import Actor from "../src/objects/actor";
import { TextureCache } from "../src/util/texture_cache";

import animationSpritemap from "./animationSpritemap.png";
import characterSpritemap from "./characterSpritemap.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

const camera = new Camera("camera", engine);

const scene = new Scene("SceneA", engine);
const scene2 = new Scene("SceneB", engine);
const scene3 = new Scene("SceneC", engine);

console.log(engine.camera)
console.log(Array.from(engine.scenes.values()));

const actorA = new Actor("actorA", scene, { pos: vec(100, 100), size: vec(64, 64) });
const actorB = new Actor("actorB", scene);

actorA.preload = async () => {
  const bitmap = await TextureCache.getInstance().load(animationSpritemap);

  console.log("Loaded bitmap: ", bitmap);

  actorA.addTexture("texmap", bitmap, vec(64, 64), 200);
  actorA.textureID = "texmap";
};

console.log(Array.from(scene.actors.values()));

console.log("Scenes: ", engine.getScenesByName("Scene"));

engine.start();
