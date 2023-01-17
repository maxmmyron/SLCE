type Section = {
  title: string;
  isCollapsed: boolean;
  sections: Array<Section>;
  items: Array<DebuggerItem>;
  addItem: (title: string, value: Object) => Section;
  removeItem: (title: string) => Section;
  addSection: (title: string, isCollapsed: boolean) => Section;
  removeSection: (title: string) => Section;
  render: (position?: Vector) => Vector;
  getSection: (title: string) => Section;
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
