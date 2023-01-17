import { vec } from "../math/vector";
import { assert } from "../util/asserts";

export class Section {
  title: string;
  isCollapsed: boolean;
  sections: Array<Section>;
  items: Array<DebuggerItem>;

  constructor(name: string, isCollapsed: boolean) {
    this.title = name;
    this.isCollapsed = isCollapsed;
    this.sections = [];
    this.items = [];
  }

  render(ctx: CanvasRenderingContext2D, position: Vector): Vector {
    const backgroundPos = vec(position.x, position.y);
    const backgroundWidth = Math.max(...this.items.map(item => ctx.measureText(`${item.title}: ${JSON.stringify(item.callback())}`).width)) + 16;

    ctx.fillStyle = this.isCollapsed ? "#222" : "#444";
    ctx.fillRect(position.x, position.y, backgroundWidth, 24);
    position.y += 24;

    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(backgroundPos.x, backgroundPos.y, backgroundWidth, this.items.length * 16 + 32);

    ctx.font = "16px monospace";
    ctx.fillStyle = "white";
    ctx.fillText(this.title, position.x + 4, position.y - 8);

    if (this.isCollapsed) return position;

    ctx.font = "11px monospace";
    this.items.forEach(item => ctx.fillText(`${item.title}: ${JSON.stringify(item.callback())}`, position.x + 8, position.y += 16));

    if (this.items.length) position.y += 8;

    this.sections.forEach(section => position.y = section.render(ctx, vec(position.x + 8, position.y)).y);

    return position;
  }

  addSection(title: string, isCollapsed: boolean): Section {
    assert(!this.sections.find((section) => section.title === title), `Debug section with name ${title} already exists`);

    const section: Section = new Section(title, isCollapsed);

    this.sections.push(section);
    return section;
  }

  removeSection(title: string): Section {
    const index = this.sections.findIndex((section) => section.title === title);
    if (index === -1) return this;

    this.items.splice(index, 1);
    return this;
  }

  getSection(title: string): Section {
    const section: Section | undefined = this.sections.find((section) => section.title === title);

    assert(section, `Debug section with name ${title} does not exist`);

    return <Section>section;
  }

  addItem(title: string, callback: () => Object): Section {
    assert(this.items.find((value) => value.title === title) === undefined, `Item with title ${title} already exists`);

    const item: DebuggerItem = { title, callback };
    this.items.push(item);
    return this;
  }

  removeItem(title: string): Section {
    const index = this.items.findIndex((value) => value.title === title);
    if (index === -1) return this;

    this.items.splice(index, 1);
    return this;
  }
}

export class Debugger {
  readonly position: Vector = vec(16, 16);
  readonly baseSection: Section;

  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.baseSection = new Section("Engine", false);
  }

  render(): void {
    this.baseSection.render(this.ctx, vec(this.position.x, this.position.y));
  }
}
