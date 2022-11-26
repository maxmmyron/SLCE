import { vec } from "../math/vector";
import Actor from "./Actor";

describe("Actor", () => {
  it("should instantiate an Actor with an ID and size", () => {
    const actor = new Actor("actor", vec(10, 10));

    expect(actor).toBeDefined();
  });

  it("should instantiate an Actor with an ID, size, and properties", () => {
    const actor = new Actor("actor", vec(10, 10), {
      pos: vec(10, 10),
    });

    expect(actor).toBeDefined();
  });
});
