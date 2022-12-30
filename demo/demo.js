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

const scene = new Scene("Scene", engine);
const scene2 = new Scene("Scene", engine);
const scene3 = new Scene("Scene", engine);

console.log(engine.camera)
console.log(Array.from(engine.scenes.values()));

const actorA = new Actor("actorA", scene);
const actorB = new Actor("actorB", scene);

TextureCache.getInstance().load(animationSpritemap).then(bitmap => {
  console.log("Loaded bitmap: ", bitmap);
  actorA.addTexture("texmap", bitmap, vec(64, 64), 200);
  actorA.textureID = "texmap";

  console.log(actorA.textures);
})


console.log(Array.from(scene.actors.values()));

console.log("Scenes: ", engine.getScenesByName("Scene"));

const handler = (delta) => { };

engine.addListener("update", handler);

engine.removeListener("update", handler);

// update: ((targetFrameTimestep: number) => void) | null = null;
// render: ((interpolationFactor: number) => void) | null = null;
