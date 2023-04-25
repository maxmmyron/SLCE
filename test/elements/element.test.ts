import { describe, it, expect } from "vitest";
import Element from "@/elements/Element";
import Engine from "@/core/Engine";

const createEngine = () => new Engine(document.createElement("canvas"));

describe("Element", () => {
  it("can be created", () => {
    const engine = createEngine();
    const element = new Element("test", engine, {});
    expect(element.name).toBe("test");
  });

});
