import { assert } from "../util/asserts";

export class Section {
  name: string;
  position: Vector;
  isCollapsed: boolean;
  sections: Array<Section>;
  items: Array<DebuggerItem>;

  constructor(name: string, position: Vector, isCollapsed: boolean) {
    this.name = name;
    this.position = position;
    this.isCollapsed = isCollapsed;
    this.sections = [];
    this.items = [];
  }

  // TODO: implement draw method
  render(ctx: CanvasRenderingContext2D): void {
    // draw section name
    // TODO: implement proper section dropdown render
    // TODO: implement pointer on dropdown hover

    // render sections

    // NOTE: sections and items should be
    // indented by some amount to indicate hierarchy

    // render items

    this.items.forEach((item, i) => {
      ctx.font = "11px monospace";
      ctx.fillStyle = "white";
      ctx.fillText(`${item.title}: ${item.value.toString()}`, this.position.x, this.position.y + (i * 12));
    });
  }

  addSection(section: Section): Section {
    assert(this.sections.find((value) => value.name === section.name) === undefined, `Section with name ${section.name} already exists`);
    this.sections.push(section);
    return section;
  }

  removeSection(section: Section): boolean {
    const index = this.sections.findIndex((value) => value === section);
    if (index === -1) return false;

    this.items.splice(index, 1);
    return true;
  }

  addItem(title: string, value: Object): Section {
    assert(this.items.find((value) => value.title === title) === undefined, `Item with title ${title} already exists`);

    const item: DebuggerItem = { title, value };
    this.items.push(item);
    return this;
  }

  removeItem(title: string): boolean {
    const index = this.items.findIndex((value) => value.title === title);
    if (index === -1) return false;

    this.items.splice(index, 1);
    return true;
  }

  updateItem(title: string, value: Object): boolean {
    const index = this.items.findIndex((value) => value.title === title);
    if (index === -1) return false;

    this.items[index].value = value;
    return true;
  }
}

export const Debugger = (() => {
  let instance: Debugger;

  const Debugger = (): Debugger => {
    let context: CanvasRenderingContext2D;

    let sections: Array<Section> = [];

    // FIXME: values don't update (pass as reference instead of val alone)
    const render = (): void => {
      sections.forEach((section) => {
        section.render(context);
      });
    };

    return {
      addSection: (name: string, position: Vector, isCollapsed: boolean): Section => {
        assert(!sections.find((section) => section.name === name), `Debug section with name ${name} already exists`);

        const section: Section = new Section(name, position, isCollapsed);

        sections.push(section);
        return section;
      },

      getSection: (name: string): Section => {
        const section: Section | undefined = sections.find((section) => section.name === name);
        assert(section, `Debug section with name ${name} does not exist`);

        return <Section>section;
      },

      render: (): void => render(),

      removeSection: (name: string): boolean => {
        if (!sections.find((section) => section.name === name)) return false;

        sections.splice(sections.findIndex((section) => section.name === name), 1).length;

        return true;
      },

      setContext: (ctx: CanvasRenderingContext2D): Debugger => {
        context = ctx;
        return instance;
      }
    }
  };

  return {
    getInstance: (): Debugger => instance || (instance = Debugger())
  };
})();
