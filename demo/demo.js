// Character spritemap is an edited version of the original made by Buch: https://opengameart.org/users/buch

import Engine from "../src/core/engine";
import { vec } from "../src/math/vector";
import Actor from "../src/objects/actor";
import { TextureLoader } from "../src/util/texture_cache";

import animationSpritemap from "./animationSpritemap.png";
import characterSpritemap from "./characterSpritemap.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

const actorMargin = 32;

let actorSize = vec(64, 82);

let actorA = new Actor(engine, "ActorA", actorSize, {
  pos: vec(engine.canvasSize.x / 2 - (actorSize.x + actorMargin), (engine.canvasSize.y - actorSize.y) / 2),
  isDebugEnabled: true,
});

actorA.preload = async () => {
  let texture = await TextureLoader.getInstance().load(characterSpritemap);
  actorA.addTexture("walkSpritemap", texture, {
    frameCount: 4,
    textureSize: vec(32, 41),
  });

  actorA.addAnimationState("walk", "walkSpritemap", {
    frameCount: 4,
    startIndex: 0,
    frameDuration: 200,
  });

  actorA.setAnimationState("walk");
};

engine.addActor(actorA);

actorSize = vec(64, 64);

const actorB = new Actor(engine, "ActorB", actorSize, {
  pos: vec(engine.canvasSize.x / 2 + (actorSize.x + actorMargin), (engine.canvasSize.y - actorSize.y) / 2),
  isDebugEnabled: true,
});

actorB.preload = async () => {
  let texture = await TextureLoader.getInstance().load(animationSpritemap);
  actorB.addTexture("spritemap", texture, {
    frameCount: 64,
    textureSize: vec(64, 64),
  });

  actorB.addAnimationState("testAnimation", "spritemap", {
    frameCount: 64,
    startIndex: 0,
    frameDuration: 200,
  });

  actorB.setAnimationState("testAnimation");
};

engine.addActor(actorB);

engine.start();
