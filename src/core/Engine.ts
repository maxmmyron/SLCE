import { createActor, moveActor } from "../core/actor";
import { createCamera } from "../core/camera";
import { addActorToScene, createScene, removeActorFromScene, updateActorInScene } from "../core/scene";
import { updateById } from "./util";

const initialEngineState: SLCE.EngineState = {
  cameras: [],
  scenes: [],
  activeCameraId: null,
  activeSceneId: null,
  deltaTime: 0, // Time elapsed since last frame
  lastUpdateTime: 0,
  isRunning: false,
  isPaused: true,
};

// Reducers (pure functions that take current state and an action, return new state)

export const engineReducer = (state: SLCE.EngineState, action: SLCE.EngineAction): SLCE.EngineState => {
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
      return {
        ...state,
        cameras: updateById(state.cameras, action.payload.cameraId, action.payload.props)
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
      return {
        ...state,
        scenes: state.scenes.map(scene =>
          scene.id === action.payload.sceneId
            ? updateActorInScene(scene, action.payload.actorId, action.payload.props)
            : scene
        )
      };
    case 'SET_RUNNING_STATE':
      return { ...state, isRunning: action.runningState };
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
const dispatch = (currentState: SLCE.EngineState, action: SLCE.EngineAction) => engineReducer(currentState, action);

// Game Loop (Higher-order function for state management)
// This is the one place where we manage a mutable 'state' variable
// to hold the current engine state for the game loop, but
// each update is still a pure function returning a new state.

export const createGameEngine = () => {
  let currentState = initialEngineState;
  let animationFrameId: number | null = null;

  const getEngineState = () => currentState; // Pure getter

  // Pure function to update the internal state
  const updateState = (newState: SLCE.EngineState) => {
    currentState = newState;
  };

  const gameLoop = (timestamp: number) => {
    if (!currentState.isRunning) {
      animationFrameId = null;
      return;
    }

    // 1. Update time
    updateState(dispatch(currentState, { type: 'UPDATE_TIME' }));

    // 2. Get active scene and camera
    const activeScene = currentState.scenes.find(s => s.id === currentState.activeSceneId);
    const activeCamera = currentState.cameras.find(c => c.id === currentState.activeCameraId);

    if (activeScene && activeCamera) {
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
      renderGame(newActiveScene, activeCamera); // Assume renderGame is defined elsewhere
    }

    animationFrameId = requestAnimationFrame(gameLoop);
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
    dispatch: (action: SLCE.EngineAction) => updateState(dispatch(currentState, action)), // Dispatch updates the internal state
    start,
    stop,
  };
};

const renderGame = (scene: SLCE.Scene, camera: SLCE.Camera) => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    // console.warn("Canvas not found!"); // Comment out for cleaner console in this example
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  scene.actors.forEach(actor => {
    ctx.fillStyle = actor.color || 'gray';
    ctx.fillRect(actor.x, actor.y, actor.width, actor.height);
  });

  ctx.restore();
};