

type CameraOptions = {
  position?: Vector;
  rotation?: Vector;
  zoom?: number;
}

type SceneOptions = {
  environment?: SceneEnvironment
}

type SceneEnvironment = {
  background: string;
  gravity: Vector;
}
