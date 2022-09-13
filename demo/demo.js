import Engine from "../src/core/Engine.js";
import { vec } from "../src/Math/Vector.js";
import Actor from "../src/Objects/Actor.js";
import TextureLayer from "../src/util/TextureLayer.js";

import grassTexturePath from "./grassTexture.png";
import dirtTexturePath from "./dirtTexture.png";
import leavesTexturePath from "./leavesTexture.png";
import woodTexturePath from "./woodTexture.png";

const canvas = document.getElementById("c");
const engine = new Engine(canvas);

engine.environment.physics.accel.y = 0;

const ground = new Actor({
  pos: vec(0, engine.environment.height - 200),
  size: vec(engine.environment.width, 200),
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

const treeWood = new Actor({
  pos: vec(256, engine.environment.height - 584),
  size: vec(64, 384),
});

treeWood.preload(async () => {
  treeWood.addTextureLayer(
    new TextureLayer(woodTexturePath, {
      isActive: true,
      size: vec(64, 64),
      tileMode: "tileY",
    })
  );
});

const treeLeavesBase = new Actor({
  pos: vec(128, engine.environment.height - 392 - 128),
  size: vec(324, 128),
});

treeLeavesBase.preload(async () => {
  treeLeavesBase.addTextureLayer(
    new TextureLayer(leavesTexturePath, {
      isActive: true,
      size: vec(64, 64),
      tileMode: "tile",
    })
  );
});

const treeLeavesTop = new Actor({
  pos: vec(192, engine.environment.height - 392 - 256),
  size: vec(192, 128),
});

treeLeavesTop.preload(async () => {
  treeLeavesTop.addTextureLayer(
    new TextureLayer(leavesTexturePath, {
      isActive: true,
      size: vec(64, 64),
      tileMode: "tile",
    })
  );
});

engine.addActor(ground);

engine.addActor(treeWood);

engine.addActor(treeLeavesBase);

engine.addActor(treeLeavesTop);

engine.start();
