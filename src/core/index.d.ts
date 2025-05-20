namespace SLCE {

  interface GameObject {
    id: string;
  }

  // actor
  export interface Actor extends GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    type?: string;
    [key: string]: any; // Allow for additional properties
  }

  export declare function createActor(props: Partial<Actor> & { x: number; y: number; width: number; height: number; }): Actor;
  export declare function moveActor(actor: Actor, dx: number, dy: number): Actor;
  export declare function scaleActor(actor: Actor, sx: number, sy: number): Actor;
  export declare function changeActorColor(actor: Actor, newColor: string): Actor;

  // camera
  export interface Camera extends GameObject {
    x: number;
    y: number;
    zoom: number;
    active: boolean;
  }

  export declare function createCamera(props: Partial<Camera> & { x: number; y: number; }): Camera;
  export declare function setCameraPosition(camera: Camera, x: number, y: number): Camera;
  export declare function setCameraZoom(camera: Camera, zoom: number): Camera;
  export declare function activateCamera(camera: Camera): Camera;
  export declare function deactivateCamera(camera: Camera): Camera;

  // scene
  export interface Scene extends GameObject {
    name: string;
    actors: Actor[];
    active: boolean;
    [key: string]: any; // Allow for additional properties
  }

  export declare function createScene(props: Partial<Scene> & { name: string }): Scene;
  export declare function addActorToScene(scene: Scene, actor: Actor): Scene;
  export declare function removeActorFromScene(scene: Scene, actorId: string): Scene;
  export declare function updateActorInScene(scene: Scene, actorId: string, newActorProps: DeepPartial<Actor>): Scene;
  export declare function activateScene(scene: Scene): Scene;
  export declare function deactivateScene(scene: Scene): Scene;

  export interface EngineState {
    cameras: Camera[];
    scenes: Scene[];
    activeCameraId: string | null;
    activeSceneId: string | null;
    deltaTime: number;
    lastUpdateTime: number;
    isRunning: boolean;
    isPaused: boolean;
  }

  type EngineAction =
    | { type: 'ADD_CAMERA'; camera: Partial<Camera> & { x: number; y: number; } }
    | { type: 'SET_ACTIVE_CAMERA'; id: Camera["id"] }
    | { type: 'UPDATE_CAMERA'; payload: { cameraId: Camera["id"]; props: DeepPartial<Camera> } }
    | { type: 'ADD_SCENE'; scene: Partial<Scene> & { name: string } }
    | { type: 'SET_ACTIVE_SCENE'; id: Scene["id"] }
    | { type: 'ADD_ACTOR_TO_SCENE'; payload: { sceneId: Scene["id"]; actorProps: Partial<Actor> & { x: number; y: number; width: number; height: number; } } }
    | { type: 'REMOVE_ACTOR_FROM_SCENE'; payload: { sceneId: Scene["id"]; actorId: Actor["id"] } }
    | { type: 'UPDATE_ACTOR_IN_SCENE'; payload: { sceneId: Scene["id"]; actorId: Actor["id"]; props: DeepPartial<Actor> } }
    | { type: 'SET_RUNNING_STATE'; runningState: boolean }
    | { type: 'UPDATE_TIME'; delta?: number  }

  declare function createGameEngine(): {
    getEngineState(): EngineState;
    dispatch(action: EngineAction): void;
    start(): void;
    stop(): void;
  };
}