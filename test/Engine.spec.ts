import { assert } from "chai";
import Engine from "../src/core/engine";

describe("Engine", () => {
  it("should instantiate", () => {
    const canvas = document.createElement("canvas");

    const engine = new Engine(canvas);

    assert.isObject(engine);
    assert.instanceOf(engine, Engine);
  });
  it("should instantiate with custom settings");
});
