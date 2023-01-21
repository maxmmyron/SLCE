interface Engineable {
  readonly canvasElement: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly parameterGUI: GUIable;
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

interface GUIable {
  readonly position: Vector;
  readonly baseSection: GUISectionable;

  lastClickPosition: Vector;

  render(): void;
}

interface GUISectionable {
  name: string;
  isCollapsed: boolean;
  subsections: Array<GUISectionable>;
  parameters: Map<string, () => Object>;

  addParameter: (name: string, callback: () => Object) => GUISectionable;
  removeParameter: (name: string) => boolean;
  addSubsection: (name: string, isCollapsed: boolean) => GUISectionable;
  removeSubsection: (name: string) => boolean;

  clear: () => void;
  render: (ctx: CanvasRenderingContext2D, position: Vector, lastClickPosition: Vector) => Vector;

  getSubsectionByTitle: (name: string) => GUISectionable;
}

type DefaultCameraProperties = {
  position?: Vector;
  rotation?: Vector;
  zoom?: number;
}

type DefaultEngineProperties = {
  isDebugEnabled?: boolean;
}
