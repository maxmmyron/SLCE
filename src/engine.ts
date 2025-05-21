import { Actor, createActor, moveActor } from "./actor";
import { Camera, createCamera } from "./camera";
import { addActorToScene, createScene, removeActorFromScene, Scene, updateActorInScene } from "./scene";
import { updateById } from "./util";

export interface Engine {
  getEngineState(): EngineState;
  dispatch(action: EngineAction): void;
  start(): void;
  stop(): void;
  addEventListener<T extends keyof EngineEvent>(type: T, callback: EngineEvent[T]): void;
  removeEventListener<T extends keyof EngineEvent>(type: T, callback: EngineEvent[T]): void;
};

export interface EngineState {
  context: CanvasRenderingContext2D;
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
  | { type: 'ADD_CAMERA'; camera: Partial<Camera> & { id: string } }
  | { type: 'SET_ACTIVE_CAMERA'; id: Camera["id"] }
  | { type: 'UPDATE_CAMERA'; payload: { cameraId: Camera["id"]; props: Partial<Camera> } }
  | { type: 'ADD_SCENE'; scene: Partial<Scene> & { id: string; name: string; } }
  | { type: 'SET_ACTIVE_SCENE'; id: Scene["id"] }
  | { type: 'ADD_ACTOR_TO_SCENE'; payload: { sceneId: Scene["id"]; actorProps: Partial<Actor> & { id:string; } } }
  | { type: 'REMOVE_ACTOR_FROM_SCENE'; payload: { sceneId: Scene["id"]; actorId: Actor["id"] } }
  | { type: 'UPDATE_ACTOR_IN_SCENE'; payload: { sceneId: Scene["id"]; actorId: Actor["id"]; props: Partial<Actor> } }
  | { type: 'SET_RUNNING_STATE'; runningState: boolean }
  | { type: 'UPDATE_TIME'; delta?: number }
  | { type: 'SET_PAUSE_STATE'; pauseState: boolean };

interface EngineEvent {
  "tick": (delta: number) => void;
  "render": (delta: number) => void;
}

const createInitialState = (context: CanvasRenderingContext2D): EngineState => ({
  context,
  cameras: [],
  scenes: [],
  activeCameraId: null,
  activeSceneId: null,
  deltaTime: 0, // Time elapsed since last frame
  lastUpdateTime: 0,
  isRunning: false,
  isPaused: true,
});

// Reducers (pure functions that take current state and an action, return new state)

export const engineReducer = (state: EngineState, action: EngineAction): EngineState => {
  switch (action.type) {
    case 'ADD_CAMERA':
      return {
        ...state,
        cameras: [...state.cameras, createCamera(action.camera)],
      };
    case 'SET_ACTIVE_CAMERA':
      return {
        ...state,
        activeCameraId: action.id,
        cameras: state.cameras.map(cam => ({
          ...cam,
          active: cam.id === action.id
        }))
      };
    case 'UPDATE_CAMERA':
      let cam = state.cameras.find(c => c.id === action.payload.cameraId);
      if(!cam) {
        console.warn("Couldn't find camera to update");
        return state;
      }

      return {
        ...state,
        cameras: updateById(state.cameras, action.payload.cameraId, {...cam, ...action.payload.props })
      };
    case 'ADD_SCENE':
      return {
        ...state,
        scenes: [...state.scenes, createScene(action.scene)],
      };
    case 'SET_ACTIVE_SCENE':
      return {
        ...state,
        activeSceneId: action.id,
        scenes: state.scenes.map(scene => ({
          ...scene,
          active: scene.id === action.id
        }))
      };
    case 'ADD_ACTOR_TO_SCENE':
      return {
        ...state,
        scenes: state.scenes.map(scene =>
          scene.id === action.payload.sceneId
            ? addActorToScene(scene, createActor(action.payload.actorProps))
            : scene
        )
      };
    case 'REMOVE_ACTOR_FROM_SCENE':
      return {
        ...state,
        scenes: state.scenes.map(scene =>
          scene.id === action.payload.sceneId
            ? removeActorFromScene(scene, action.payload.actorId)
            : scene
        )
      };
    case 'UPDATE_ACTOR_IN_SCENE':
      const scene = state.scenes.find(s => s.id === action.payload.sceneId);
      if(!scene) return state;
      const actor = scene.actors.find(s => s.id === action.payload.actorId);
      if(!actor) return state;

      return {
        ...state,
        scenes: state.scenes.map(scene =>
          scene.id === action.payload.sceneId
            ? updateActorInScene(scene, action.payload.actorId, {...actor, ...action.payload.props} )
            : scene
        )
      };
    case 'SET_RUNNING_STATE':
      return { ...state, isRunning: action.runningState };
    case 'SET_PAUSE_STATE':
      return { ...state, isPaused: action.pauseState };
    case 'UPDATE_TIME':
      const currentTime = performance.now();
      const deltaTime = (currentTime - state.lastUpdateTime) / 1000; // in seconds
      return {
        ...state,
        deltaTime: deltaTime,
        lastUpdateTime: currentTime
      };
    default:
      return state;
  }
};

// Dispatcher for actions (pure function)
const dispatch = (currentState: EngineState, action: EngineAction) => engineReducer(currentState, action);

// Game Loop (Higher-order function for state management)
// This is the one place where we manage a mutable 'state' variable
// to hold the current engine state for the game loop, but
// each update is still a pure function returning a new state.

export const createGameEngine = (context: CanvasRenderingContext2D): Engine => {
  let currentState = createInitialState(context);
  let eventListeners: { [K in keyof EngineEvent]: Array<EngineEvent[K]> } = {
    render: [],
    tick: []
  }
  let animationFrameId: number | null = null;

  const getEngineState = () => currentState; // Pure getter

  // Pure function to update the internal state
  const updateState = (newState: EngineState) => {
    currentState = newState;
  };

  const addEventListener = <T extends keyof EngineEvent>(type: T, callback: EngineEvent[T]) => {
    // refuse to add duplicate of the same callback (i.e. same referenced object, this doesn't apply for anonymous fns).
    if(eventListeners[type].find((cb) => cb === callback)) return;

    eventListeners = {
      ...eventListeners,
      [type]: [...eventListeners[type], callback],
    };
  };

  const removeEventListener =  <T extends keyof EngineEvent>(type: T, callback: EngineEvent[T]) => {
    eventListeners = {
      ...eventListeners,
      [type]: eventListeners[type].filter(cb => cb !== callback),
    }
  }

  const gameLoop = (timestamp: number) => {
    if (!currentState.isRunning) {
      animationFrameId = null;
      return;
    }

    console.log('u');

    animationFrameId = requestAnimationFrame(gameLoop);
    if(currentState.isPaused) {
      return;
    }

    // 1. Update time
    updateState(dispatch(currentState, { type: 'UPDATE_TIME' }));

    // 2. Get active scene and camera
    const activeScene = currentState.scenes.find(s => s.id === currentState.activeSceneId);
    const activeCamera = currentState.cameras.find(c => c.id === currentState.activeCameraId);

    if (activeScene && activeCamera) {
      console.log("u2")
      // 3. Process game logic (e.g., actor updates based on rules)
      // This is where game-specific "systems" or "processors" would operate.
      // Each system would take the current scene/actors and return a *new*
      // updated version of them.
      let updatedActors = activeScene.actors;

      // Example: Simple actor movement system
      updatedActors = updatedActors.map(actor => {
        if (actor.type === 'player') {
          // Imagine input handling here, this is just an example
          return moveActor(actor, 1 * currentState.deltaTime, 0); // Move right
        }
        return actor;
      });

      // Update the active scene with the new actors
      const newActiveScene = { ...activeScene, actors: updatedActors };
      const newScenes = updateById(currentState.scenes, newActiveScene.id, newActiveScene);
      updateState({ ...currentState, scenes: newScenes });


      // 4. Render (separate module would handle this)
      // The rendering function would be a pure function that takes the activeScene
      // and activeCamera and draws them to a canvas/DOM.
      // It *does not* modify the engine state.
      renderGame(currentState.context, newActiveScene, activeCamera); // Assume renderGame is defined elsewhere
    }
  };

  const start = () => {
    if (!currentState.isRunning) {
      updateState(dispatch(currentState, { type: 'SET_RUNNING_STATE', runningState: true }));
      updateState({ ...currentState, lastUpdateTime: performance.now() }); // Initialize last update time
      animationFrameId = requestAnimationFrame(gameLoop);
      console.log('Engine started.');
    }
  };

  const stop = () => {
    if (currentState.isRunning) {
      updateState(dispatch(currentState, { type: 'SET_RUNNING_STATE', runningState: false }));
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      console.log('Engine stopped.');
    }
  };

  // Public API of the engine
  return {
    getEngineState,
    dispatch: (action: EngineAction) => updateState(dispatch(currentState, action)), // Dispatch updates the internal state
    start,
    stop,
    addEventListener,
    removeEventListener,
  };
}

const renderGame = (ctx: CanvasRenderingContext2D, scene: Scene, camera: Camera) => {

  ctx.clearRect(0, 0, 1000, 1000);

  console.log('a');

  ctx.save();

  ctx.translate(1000 / 2, 1000 / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  scene.actors.forEach(actor => {
    ctx.fillStyle = actor.color || 'gray';
    ctx.fillRect(actor.x, actor.y, actor.width, actor.height);
  });

  ctx.restore();
};