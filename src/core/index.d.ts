type EngineEvent = {
  type: EngineEvents;
  payload: any;
  comparatorKey: string | null;
  isPersistent: boolean;
}

type EngineEvents =
  "onmousedown" |
  "whilemousedown" |
  "onmouseup" |
  "onkeydown" |
  "whilekeydown" |
  "onkeyup" |
  "oncanvasresize";

type CameraOptions = {
  position?: Vector;
  rotation?: Vector;
  zoom?: number;
}

type SceneOptions = {}
