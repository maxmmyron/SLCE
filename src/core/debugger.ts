import { assert } from "../util/asserts";

class Section {
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

  }

  addSection(section: Section): Section {
    assert(this.sections.find((value) => value.name === section.name) === undefined, `Section with name ${section.name} already exists`);
    this.sections.push(section);
    return section;
  }

  addItem(item: DebuggerItem): boolean {
    assert(this.items.find((value) => value.title === item.title) === undefined, `Item with title ${item.title} already exists`);
    this.items.push(item);
    return true;
  }

  removeSection(section: Section): boolean {
    const index = this.sections.findIndex((value) => value === section);
    if (index === -1) return false;

    this.items.splice(index, 1);
    return true;
  }

  removeItem(item: DebuggerItem): boolean {
    const index = this.items.findIndex((value) => value === item);
    if (index === -1) return false;

    this.items.splice(index, 1);
    return true;
  }
}

export const Debugger = (() => {
  let instance: Debugger;

  const Debugger = (): Debugger => {
    let context: CanvasRenderingContext2D;

    let sections: Array<Section> = [];

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

      render: (): void => render(),

      removeSection: (name: string): boolean => {
        if (!sections.find((section) => section.name === name)) return false;

        sections.splice(sections.findIndex((section) => section.name === name), 1).length;

        return true;
      },

      setContext: (ctx: CanvasRenderingContext2D): void => { context = ctx; }
    }
  };

  return {
    getInstance: (): Debugger => instance || (instance = Debugger())
  };
})();
