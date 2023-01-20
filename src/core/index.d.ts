interface Engineable {
  readonly canvasElement: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly debugger: Debuggerable;
  readonly eventHandler: EventHandler;

  scenes: Map<string, import("../elements/scene").default>;

  // TODO: determine if this is a necessary property. Currently, cameras are
  // attached to engine & scene; it may only be necessary to attach to scene.
  camera: Camerable | null;

  preloadedActorCount: number;

  getScenesByName(name: string): Array<(import("../elements/scene").default)>;

  start(): Promise<void>;
  pause(): void;
  resume(): void;

  addListener(eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)): void;
  removeListener(eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)): void;

  get canvasSize(): Vector;
  get engineRuntimeMilliseconds(): number;
  get engineStartTimestamp(): number;
  get FPS(): number;
  get isPaused(): boolean;
}

interface Camerable {
  readonly name: string;
  readonly engine: Engineable;

  position: Vector;
  velocity: Vector;
  rotation: Vector;
  zoom: number;

  addListener(eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)): void;
  removeListener(eventName: ValidEventType, callback: ((ev: ValidEventPayload) => void)): void;
}

interface Debuggerable {
  readonly position: Vector;
  readonly baseSection: DebugSectionable;

  lastClickPosition: Vector;

  render(): void;
}

interface DebugSectionable {
  title: string;
  isCollapsed: boolean;
  sections: Array<import("./debugger").Section>;
  items: Array<DebuggerItem>;

  addItem: (title: string, callback: () => Object) => import("./debugger").Section;
  removeItem: (title: string) => import("./debugger").Section;
  addSection: (title: string, isCollapsed: boolean) => import("./debugger").Section;
  removeSection: (title: string) => import("./debugger").Section;
  render: (ctx: CanvasRenderingContext2D, position: Vector, lastClickPosition: Vector) => Vector;
  getSection: (title: string) => import("./debugger").Section;
}

type DebuggerItem = {
  title: string;
  callback: () => Object;
}

type DefaultCameraProperties = {
  position?: Vector;
  rotation?: Vector;
  zoom?: number;
}

type DefaultEngineProperties = {
  isDebugEnabled?: boolean;
}
