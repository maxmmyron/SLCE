type Debugger = {
  addDebugSection(name: string): number;
  addValue(section: string, value: any): number;
  drawDebug(): void;
  removeDebugSection(name: string): number;
  removeValue(section: string, value: any): number;
  setContext: (context: CanvasRenderingContext2D) => void;
}

// TODO: add more robust section system (collapse support, type of object, etc.)

type CameraOptions = {
  position?: Vector;
  rotation?: Vector;
  zoom?: number;
}
