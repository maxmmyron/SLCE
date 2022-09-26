import Engine from "../src/core/Engine.js";
import { vec } from "../src/Math/Vector.js";
import Actor from "../src/Objects/Actor.js";
import TextureLayer from "../src/util/TextureLayer.js";

import grassTexturePath from "./grassTexture.png";
import dirtTexturePath from "./dirtTexture.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

const ground = new Actor({
  pos: vec(0, engine.environment.height - 200),
  size: vec(engine.environment.width, 500),
});

ground.preload(async () => {
  ground.addTextureLayer(
    new TextureLayer(dirtTexturePath, {
      isActive: true,
      size: vec(64, 64),
      tileMode: "tile",
      zIndex: 0,
    })
  );
  ground.addTextureLayer(
    new TextureLayer(grassTexturePath, {
      isActive: true,
      size: vec(64, 64),
      tileMode: "tileX",
      zIndex: 1,
    })
  );
});

ground.update = (timestamp) => {
  ground.pos.x += 0.1 * Math.cos(engine.getCurrentEngineTime() / 1000) * 10;
};

engine.addActor(ground);

engine.start();
