import { vec } from "../math/vector";
import { assert } from "../util/asserts";

export class Section {
  title: string;
  isCollapsed: boolean;
  sections: Array<Section>;
  items: Array<DebuggerItem>;

  constructor(name: string, isCollapsed: boolean = false) {
    this.title = name;
    this.isCollapsed = isCollapsed;
    this.sections = [];
    this.items = [];
  }

  render(ctx: CanvasRenderingContext2D, position: Vector, lastClickPosition: Vector): Vector {
    let items = this.items.map(item => `${item.title}: ${JSON.stringify(item.callback(), (_, value: any) => {
      if (typeof value === "function") return value.name;
      if (typeof value === "number") return value.toFixed(2);
      return value;
    })}`);

    const backgroundPos = vec(position.x, position.y);
    let backgroundWidth = Math.max(...items.map(item => ctx.measureText(item).width)) + 64;
    backgroundWidth -= backgroundWidth % 50;

    if (lastClickPosition.x > backgroundPos.x &&
      lastClickPosition.x < backgroundPos.x + backgroundWidth &&
      lastClickPosition.y > backgroundPos.y &&
      lastClickPosition.y < backgroundPos.y + 24)
      this.isCollapsed = !this.isCollapsed;

    if (!this.isCollapsed) {
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(backgroundPos.x, backgroundPos.y, backgroundWidth, this.items.length * 16 + 32);
    }

    ctx.fillStyle = this.isCollapsed ? "#222" : "#444";
    ctx.fillRect(position.x, position.y, this.isCollapsed ? 150 : backgroundWidth, 24);
    position.y += 24;

    ctx.font = "1rem monospace";
    ctx.fillStyle = "white";
    ctx.fillText(this.title + (this.isCollapsed ? " +" : " -"), position.x + 4, position.y - 8);

    if (this.isCollapsed) return position;

    ctx.font = "1rem monospace";
    items.forEach(item => ctx.fillText(item, position.x + 8, position.y += 16));

    if (this.items.length) position.y += 8;

    this.sections.forEach(section => position.y = section.render(ctx, vec(position.x + 8, position.y), lastClickPosition).y);

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
  lastClickPosition: Vector = vec(0, 0);

  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.baseSection = new Section("Engine", false);
  }

  render(): void {
    this.baseSection.render(this.ctx, vec(this.position.x, this.position.y), this.lastClickPosition);
    this.lastClickPosition = vec(0, 0);
  }
}
