type Section = {
  title: string;
  isCollapsed: boolean;
  sections: Array<Section>;
  items: Array<DebuggerItem>;
  addItem: (title: string, value: Object) => Section;
  removeItem: (title: string) => Section;
  updateItem: (title: string, value: Object) => Section;
  addSection: (title: string, isCollapsed: boolean) => Section;
  removeSection: (title: string) => Section;
  render: (position?: Vector) => Vector;
  getSection: (title: string) => Section;
}

type Debugger = {
  setContext: (context: CanvasRenderingContext2D) => Section;
  getInstance: () => Section;
}

type DebuggerItem = {
  title: string;
  value: Function;
}

type CameraOptions = {
  position?: Vector;
  rotation?: Vector;
  zoom?: number;
}
