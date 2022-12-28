// Character spritemap is an edited version of the original made by Buch: https://opengameart.org/users/buch

import { Camera } from "../src/core/Camera";
import Engine from "../src/core/engine";
import { Scene } from "../src/core/Scene";
import { vec } from "../src/math/vector";
import Actor from "../src/objects/actor";
import { TextureCache } from "../src/util/texture_cache";

import animationSpritemap from "./animationSpritemap.png";
import characterSpritemap from "./characterSpritemap.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

const camera = new Camera("camera", engine);

const scene = new Scene("Scene", engine);

console.log(engine.camera)
console.log(Array.from(engine.scenes.values()));

const actorA = new Actor("actorA", scene);
const actorB = new Actor("actorB", scene);

console.log(Array.from(scene.actors.values()));

// console.log(engine.getScenesByName("Scene"));
