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
