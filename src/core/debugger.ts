import { vec } from "../math/vector";
import { assert } from "../util/asserts";

//TODO: simplify: combine Section class and Debugger class into one

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
    ctx.font = "16px monospace";
    ctx.fillStyle = this.isCollapsed ? "#222" : "#444";

    ctx.fillRect(position.x, position.y, 100, 24);
    position.y += 24;

    ctx.fillStyle = "white";
    ctx.fillText(this.title, position.x + 4, position.y - 8);

    ctx.font = "11px monospace";
    ctx.fillStyle = "black";
    ctx.save();

    if (this.isCollapsed) return position;

    ctx.font = "11px monospace";
    ctx.fillStyle = "white";



    this.items.forEach(item => ctx.fillText(`${item.title}: ${JSON.stringify(item.value)}`, position.x + 8, position.y += 16));

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

  addItem(title: string, value: Object): Section {
    assert(this.items.find((value) => value.title === title) === undefined, `Item with title ${title} already exists`);

    const item: DebuggerItem = { title, value };
    this.items.push(item);
    return this;
  }

  removeItem(title: string): Section {
    const index = this.items.findIndex((value) => value.title === title);
    if (index === -1) return this;

    this.items.splice(index, 1);
    return this;
  }

  updateItem(title: string, value: Object): Section {
    const index = this.items.findIndex((value) => value.title === title);
    if (index === -1) return this;

    this.items[index].value = value;
    return this;
  }
}

export const Debugger = (() => {
  let instance: Debugger;

  const Debugger = (): Debugger => {
    let context: CanvasRenderingContext2D;
    let position: Vector = vec(16, 16);

    let sections: Array<Section> = [];

    // FIXME: values don't update (pass as reference instead of val alone)
    const render = (): void => {
      sections.forEach((section) => {
        section.render(context, vec(position.x, position.y));
      });
    };

    return {
      addSection: (name: string, isCollapsed: boolean): Section => {
        assert(!sections.find((section) => section.title === name), `Debug section with name ${name} already exists`);

        const section: Section = new Section(name, isCollapsed);

        sections.push(section);
        return section;
      },

      removeSection: (name: string): Debugger => {
        if (!sections.find((section) => section.title === name)) return instance;

        sections.splice(sections.findIndex((section) => section.title === name), 1).length;

        return instance;
      },

      render: (): void => render(),

      getSection: (name: string): Section => {
        const section: Section | undefined = sections.find((section) => section.title === name);
        assert(section, `Debug section with name ${name} does not exist`);

        return <Section>section;
      },

      setContext: (ctx: CanvasRenderingContext2D): Debugger => {
        context = ctx;
        return instance;
      },

      setPosition: (pos: Vector): Debugger => {
        position = pos;
        return instance;
      },
    }
  };

  return {
    getInstance: (): Debugger => instance || (instance = Debugger())
  };
})();
