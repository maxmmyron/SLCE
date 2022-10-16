import Engine from "../src/core/Engine";
import { vec } from "../src/math/Vector";
import Actor from "../src/objects/Actor";

import animationSpritemap from "./animationSpritemap.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

const engineWidth = engine.environment.properties.size.x;
const engineHeight = engine.environment.properties.size.y;

const playerSize = vec(64, 64);

const playerMargin = 32;

const playersPerRow = engineWidth / (playerSize.x + playerMargin);
const playersPerColumn = engineHeight / (playerSize.y + playerMargin);

for (let i = 0; i < playersPerRow; i++) {
  for (let j = 0; j < playersPerColumn; j++) {
    const player = new Actor({
      pos: vec(
        i * (playerSize.x + playerMargin),
        j * (playerSize.y + playerMargin)
      ),
      size: playerSize,
      isDebugEnabled: true,
    });

    player
      .preload(async () => {
        await player.loadTexture("animation", animationSpritemap, {
          frameCount: 64,
          spriteSize: vec(64, 64),
        });
        console.log(`${i + i * j} texture loaded`);
        player.addAnimationState("idle", "animation", {
          frameCount: 64,
          startIndex: 0,
          frameDuration: 200,
        });
        player.setAnimationState("idle");
      })
      .then(() => {
        console.log(`${i + i * j} preload finished`);
      });

    engine.addActor(player);
  }
}

engine.start();
