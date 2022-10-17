import Engine from "../src/core/Engine";
import { vec } from "../src/math/Vector";
import Actor from "../src/objects/Actor";
import { TextureLoader } from "../src/util/TextureLoader";

import animationSpritemap from "./animationSpritemap.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

const engineWidth = engine.environment.properties.size.x;
const engineHeight = engine.environment.properties.size.y;

const actorSize = vec(64, 64);
const actorMargin = 32;

const actorsPerRow = Math.floor(engineWidth / (actorSize.x + actorMargin));
const actorsPerColumn = Math.floor(engineHeight / (actorSize.y + actorMargin));

const texture = TextureLoader.getInstance().load(animationSpritemap);

texture.then((texture) => {
  for (let i = 0; i < actorsPerRow; i++) {
    for (let j = 0; j < actorsPerColumn; j++) {
      const actor = new Actor({
        pos: vec(
          i * (actorSize.x + actorMargin),
          j * (actorSize.y + actorMargin)
        ),
        size: actorSize,
        isDebugEnabled: true,
      });

      actor.preload(async () => {
        actor.addTexture("animation", texture, {
          frameCount: 64,
          spriteSize: vec(64, 64),
        });

        actor.addAnimationState("idle", "animation", {
          frameCount: 64,
          startIndex: 0,
          frameDuration: 200,
        });
        actor.setAnimationState("idle");
      });

      engine.addActor(actor);
    }
  }
});

engine.start();
