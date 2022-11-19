// Character spritemap is an edited version of the original made by Buch: https://opengameart.org/users/buch

import Engine from "../src/core/Engine";
import { vec } from "../src/math/Vector";
import Actor from "../src/objects/Actor";
import { TextureLoader } from "../src/util/TextureLoader";

import animationSpritemap from "./animationSpritemap.png";
import characterSpritemap from "./characterSpritemap.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

const engineWidth = engine.environment.properties.size.x;
const engineHeight = engine.environment.properties.size.y;

const actorMargin = 32;

let actorSize = vec(64, 82);

let actorA = new Actor({
  pos: vec(engineWidth / 2 - (actorSize.x + actorMargin), (engineHeight - actorSize.y) / 2),
  size: actorSize,
  isDebugEnabled: true,
});

actorA.preload = async () => {
  let texture = await TextureLoader.getInstance().load(characterSpritemap);
  actorA.addTexture("walkSpritemap", texture, {
    frameCount: 4,
    spriteSize: vec(32, 41),
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

const actorB = new Actor({
  pos: vec(engineWidth / 2 + (actorSize.x + actorMargin), (engineHeight - actorSize.y) / 2),
  size: actorSize,
  isDebugEnabled: true,
});

actorB.preload = async () => {
  let texture = await TextureLoader.getInstance().load(animationSpritemap);
  actorB.addTexture("spritemap", texture, {
    frameCount: 64,
    spriteSize: vec(64, 64),
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
