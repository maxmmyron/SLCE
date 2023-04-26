interface Engineable {
  readonly canvasElement: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly parameterGUI: GUIable;
  readonly eventHandler: EventHandler;
  readonly textureHandler: TextureHandler;

  scenes: Map<string, import("../elements/scene").default>;

  preloadedActorCount: number;

  isPaused: boolean;

  getScenesByName(name: string): Array<(import("../elements/scene").default)>;

  start(): Promise<void>;

  registerEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void;
  unregisterEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void;

  get canvasSize(): Vectorable;
  get engineRuntimeMilliseconds(): number;
  get engineStartTimestamp(): number;
  get FPS(): number;
}

interface Camerable {
  readonly name: string;
  readonly engine: Engineable;

  position: Vectorable;
  velocity: Vectorable;
  rotation: Vectorable;
  zoom: number;

  registerEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void;
  unregisterEventCallback<Type extends keyof EngineEventHandlersEventMap>(type: Type, callback: (payload: EngineEventHandlersEventMap[Type]) => any): void;
}

interface GUIable {
  readonly position: Vectorable;
  readonly baseSection: GUISectionable;

  lastClickPosition: Vectorable;

  isEnabled: boolean;

  render(ctx: CanvasRenderingContext2D): void;
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
  render: (ctx: CanvasRenderingContext2D, position: Vectorable, lastClickPosition: Vectorable) => Vectorable;

  getSubsectionByTitle: (name: string) => GUISectionable;
}

type CameraOptions = Partial<{
  position?: Vectorable;
  rotation?: Vectorable;
  zoom?: number;
}>;

type EngineOptions = Partial<{
  isDebugEnabled?: boolean;
}>;
