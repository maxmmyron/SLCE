import Vector2D from "../math/vector2d.ts";
import { assert } from "../util/asserts.ts";

export class ParameterSection implements GUISectionable {
  /**
   * The name of the section.
   */
  name: string;

  /**
   * A tracking flag for whether or not the section should render as collapsed.
   */
  isCollapsed: boolean;

  /**
   * A list of subsections that are contained within this section.
   *
   * @default []
   */
  subsections: Array<GUISectionable> = [];

  /**
   * A map containing string keys and callback functions that return a parameter to be displayed.
   *
   * @default new Map()
   */
  parameters: Map<string, () => Object> = new Map();

  /**
   * Creates a new section.
   *
   * @param name The name of the section.
   * @param isCollapsed (optional) Whether or not the section should render as collapsed.
   * Defaults to false.
   */
  constructor(name: string, isCollapsed: boolean = false) {
    this.name = name;
    this.isCollapsed = isCollapsed;
  }

  /**
   * Adds a new parameter to the current section.
   *
   * @param name The title of the parameter.
   * @param callback A callback function that returns the parameter to be displayed.
   *
   * @returns The current section.
   */
  addParameter(name: string, callback: () => Object): GUISectionable {
    assert(!this.parameters.has(name), `Parameter with name ${name} already exists`);

    this.parameters.set(name, callback);
    return this;
  };

  /**
   * Removes a parameter from the current section.
   *
   * @param name The name of the parameter to remove.
   *
   * @returns True if the parameter was removed, false otherwise.
   */
  removeParameter(name: string): boolean {
    return this.parameters.delete(name);
  }

  /**
   * Attaches a new subsection to the current section.
   *
   * @param name The name of the section.
   * @param isCollapsed (optional) Whether or not the section should render as collapsed.
   * Defaults to false.
   * @returns The newly created section.
   */
  addSubsection(name: string, isCollapsed: boolean): GUISectionable {
    assert(!this.subsections.find((section) => section.name === name), `Debug section with name ${name} already exists`);

    const section = new ParameterSection(name, isCollapsed);

    this.subsections.push(section);
    return section;
  }

  removeSubsection(name: string): boolean {
    const index = this.subsections.findIndex((section) => section.name === name);
    if (index === -1) return false;

    this.subsections.splice(index, 1);
    return true;
  }

  /**
   * Removes all subsections and parameters from the current section.
   */
  clear(): void {
    this.subsections = [];
    this.parameters.clear();
  }

  /**
   * Renders the current section, all subsections, and all parameters.
   *
   * @param ctx the canvas context to render to
   * @param position the position at which to render the section
   * @param lastClickPosition the position the last click was made at. Used to
   * determine if the section should collapse.
   *
   * @returns the posiiton at which to render the next section
   */
  render(ctx: CanvasRenderingContext2D, position: Vector2D, lastClickPosition: Vector2D): Vector2D {
    let formattedParameters = Array.from(this.parameters.entries()).map(([name, callback]) => `${name}: ${JSON.stringify(callback(), (_, value: any) => {
      if (typeof value === "function") return value.name;
      if (typeof value === "number") return value.toFixed(2);
      return value;
    })}`);

    const backgroundPos = new Vector2D(position.x, position.y);
    let maxBackgroundWidth = Math.max(...formattedParameters.map(parameter => ctx.measureText(parameter).width)) + 64;
    maxBackgroundWidth -= maxBackgroundWidth % 50;

    if (lastClickPosition.x > backgroundPos.x &&
      lastClickPosition.x < backgroundPos.x + maxBackgroundWidth &&
      lastClickPosition.y > backgroundPos.y &&
      lastClickPosition.y < backgroundPos.y + 24)
      this.isCollapsed = !this.isCollapsed;

    if (!this.isCollapsed) {
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(backgroundPos.x, backgroundPos.y, maxBackgroundWidth, this.parameters.size * 16 + 32);
    }

    ctx.fillStyle = this.isCollapsed ? "#222" : "#444";
    ctx.fillRect(position.x, position.y, this.isCollapsed ? 150 : maxBackgroundWidth, 24);
    position.y += 24;

    ctx.font = "1rem monospace";
    ctx.fillStyle = "white";
    ctx.fillText(this.name + (this.isCollapsed ? " +" : " -"), position.x + 4, position.y - 8);

    if (this.isCollapsed) return position;

    ctx.font = "1rem monospace";
    formattedParameters.forEach(parameter => ctx.fillText(parameter, position.x + 8, position.y += 16));

    if (this.parameters.size) position.y += 8;

    this.subsections.forEach(section => position.y = section.render(ctx, new Vector2D(position.x + 8, position.y), lastClickPosition).y);

    return position;
  }

  /**
   * Gets a subsection by its title
   *
   * @param name the title of the subsection to look for
   * @returns the subsection
   *
   * @throws if the subsection does not exist
   */
  getSubsectionByTitle(name: string): GUISectionable {
    const section: GUISectionable | undefined = this.subsections.find((section) => section.name === name);
    if (!section) throw new Error(`Debug section with name ${name} does not exist`);

    return section;
  }
}

export default class ParameterGUI implements GUIable {
  /**
   * The position of the overlay on the screen.
   */
  readonly position: Vector2D = new Vector2D(16, 16);

  /**
   * The base section of the GUI. All other sections are attached to this one.
   */
  readonly baseSection: GUISectionable;

  /**
   * The position of the last click made on the overlay
   */
  lastClickPosition: Vector2D = new Vector2D(0, 0);

  /**
   * Whether the engine will display a debug overlay with performance diagnostics.
   *
   * @default false
   */
  isEnabled: boolean = false;

  /**
   * Creates a new ParameterGUI instance.
   */
  constructor() {
    this.baseSection = new ParameterSection("Engine", false);
  }

  /**
   * Renders the parameter GUI overlay if it is enabled.
   *
   * @param ctx the canavs context to render to
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.isEnabled) return;

    this.baseSection.render(ctx, new Vector2D(this.position.x, this.position.y), this.lastClickPosition);
    this.lastClickPosition = new Vector2D(0, 0);
  }
}
