type Debugger = {
  addSection: (name: string, isCollapsed: boolean) => import("./debugger").Section;
  removeSection: (name: string) => Debugger;
  render(): void;
  getSection: (name: string) => import("./debugger").Section;
  setContext: (context: CanvasRenderingContext2D) => Debugger;
  setPosition: (position: Vector) => Debugger;
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
