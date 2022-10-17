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

const actorSize = vec(64, 82);
const actorMargin = 32;

const actorsPerRow = Math.floor(engineWidth / (actorSize.x + actorMargin));
const actorsPerColumn = Math.floor(engineHeight / (actorSize.y + actorMargin));

const characterTexture = TextureLoader.getInstance().load(characterSpritemap);

characterTexture.then((texture) => {
  const actor = new Actor({
    pos: vec(
      engineWidth / 2 - (actorSize.x + actorMargin),
      (engineHeight - actorSize.y) / 2
    ),
    size: actorSize,
    isDebugEnabled: true,
  });

  actor.preload(async () => {
    actor.addTexture("walkSpritemap", texture, {
      frameCount: 4,
      spriteSize: vec(32, 41),
    });

    actor.addAnimationState("walk", "walkSpritemap", {
      frameCount: 4,
      startIndex: 0,
      frameDuration: 200,
    });
    actor.setAnimationState("walk");
  });

  engine.addActor(actor);
});

const testTexture = TextureLoader.getInstance().load(animationSpritemap);

testTexture.then((texture) => {
  const actor = new Actor({
    pos: vec(
      engineWidth / 2 + (actorSize.x + actorMargin),
      (engineHeight - 64) / 2
    ),
    size: vec(64, 64),
    isDebugEnabled: true,
  });

  actor.preload(async () => {
    actor.addTexture("testSpritemap", texture, {
      frameCount: 64,
      spriteSize: vec(64, 64),
    });

    actor.addAnimationState("testAnimation", "testSpritemap", {
      frameCount: 64,
      startIndex: 0,
      frameDuration: 200,
    });
    actor.setAnimationState("testAnimation");
  });

  engine.addActor(actor);
});

engine.start();
