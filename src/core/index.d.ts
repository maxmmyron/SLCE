type Debugger = {
  addSection: (name: string, position: Vector, isCollapsed: boolean) => import("./debugger").Section;
  getSection: (name: string) => import("./debugger").Section;
  render(): void;
  removeSection: (name: string) => boolean;
  setContext: (context: CanvasRenderingContext2D) => Debugger;
}

type DebuggerItem = {
  title: string;
  value: Object;
}

type CameraOptions = {
  position?: Vector;
  rotation?: Vector;
  zoom?: number;
}
