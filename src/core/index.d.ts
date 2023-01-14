type Debugger = {
  addSection(name: string, position: Vector, isCollapsed: boolean): any;
  render(): void;
  removeSection(name: string): boolean;
  setContext: (context: CanvasRenderingContext2D) => void;
}

type DebuggerItem = {
  title: string;
  value: string;
}

type CameraOptions = {
  position?: Vector;
  rotation?: Vector;
  zoom?: number;
}
