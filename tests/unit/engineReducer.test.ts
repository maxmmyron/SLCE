// tests/unit/engineReducer.test.js
import { describe, it, expect, vi } from 'vitest';
import { engineReducer, EngineState } from '../../src/engine';
import { createActor } from '../../src/actor'; // Mocked or imported
import { createCamera } from '../../src/camera'; // Mocked or imported
import { createScene } from '../../src/scene';   // Mocked or imported

// Mock IDs for consistent testing
vi.mock('../../src/core/Actor', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        // @ts-ignore
        ...actual,
        createActor: vi.fn((props) => ({ ...props, id: props.id || 'mock-actor-id' })),
    };
});
vi.mock('../../src/camera', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        // @ts-ignore
        ...actual,
        createCamera: vi.fn((props) => ({ ...props, id: props.id || 'mock-camera-id' })),
    };
});
vi.mock('../../src/scene', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        // @ts-ignore
        ...actual,
        createScene: vi.fn((props) => ({ ...props, id: props.id || 'mock-scene-id' })),
    };
});


describe('Engine Reducer Unit Tests', () => {
  const initial = {
    context: {} as CanvasRenderingContext2D,
    cameras: [],
    scenes: [],
    activeCameraId: null,
    activeSceneId: null,
    deltaTime: 0,
    lastUpdateTime: 0,
    isRunning: false,
    isPaused: true
  } as EngineState;

  it('should handle ADD_CAMERA action', () => {
    console.log(initial);
    const camID = crypto.randomUUID();
    const state = engineReducer(initial, { type: 'ADD_CAMERA', camera: { id: camID, x: 0, y: 0 } });
    console.log(state.cameras[0]);
    expect(state.cameras).toHaveLength(1);
    expect(state.cameras[0].id).toBe(camID);
    expect(state.cameras[0].x).toBe(0);
    expect(state.cameras[0].active).toBe(false);
    expect(state).not.toBe(initial); // Ensure immutability
  });

  it('should handle SET_ACTIVE_CAMERA action', () => {
    const camID = crypto.randomUUID();
    const stateWithCam = engineReducer(initial, { type: 'ADD_CAMERA', camera: { id: camID, x: 0, y: 0 } });
    const state = engineReducer(stateWithCam, { type: 'SET_ACTIVE_CAMERA', id: camID });
    expect(state.activeCameraId).toBe(camID);
    expect(state.cameras[0].active).toBe(true);
    expect(state).not.toBe(stateWithCam);
  });

  it('should handle UPDATE_CAMERA action', () => {
    const camID = crypto.randomUUID();
    const stateWithCam = engineReducer(initial, { type: 'ADD_CAMERA', camera: { id: camID, x: 0, y: 0 } });
    const state = engineReducer(stateWithCam, { type: 'UPDATE_CAMERA', payload: { cameraId: camID, props: { zoom: 2 } } });
    expect(state.cameras[0].zoom).toBe(2);
    expect(state).not.toBe(stateWithCam);
  });

  it('should handle ADD_SCENE action', () => {
    const sceneID = crypto.randomUUID();
    const state = engineReducer(initial, { type: 'ADD_SCENE', scene: { id: sceneID, name: 'Level 1' } });
    expect(state.scenes).toHaveLength(1);
    expect(state.scenes[0].id).toBe(sceneID);
    expect(state.scenes[0].name).toBe('Level 1');
    expect(state.scenes[0].active).toBe(false);
    expect(state).not.toBe(initial);
  });

  it('should handle SET_ACTIVE_SCENE action', () => {
    const sceneID = crypto.randomUUID();
    const stateWithScene = engineReducer(initial, { type: 'ADD_SCENE', scene: { id: sceneID, name: 'Level 1' } });
    const state = engineReducer(stateWithScene, { type: 'SET_ACTIVE_SCENE', id: sceneID } );
    expect(state.activeSceneId).toBe(sceneID);
    expect(state.scenes[0].active).toBe(true);
    expect(state).not.toBe(stateWithScene);
  });

  it('should handle ADD_ACTOR_TO_SCENE action', () => {
    const sceneID = crypto.randomUUID();
    const actorID = crypto.randomUUID();
    const stateWithScene = engineReducer(initial, { type: 'ADD_SCENE', scene: { id: sceneID, name: 'Level 1' } });
    const state = engineReducer(stateWithScene, {
      type: 'ADD_ACTOR_TO_SCENE',
      payload: { sceneId: sceneID, actorProps: { id: actorID, x: 0, y: 0, width: 10, height: 10 } }
    });
    expect(state.scenes[0].actors).toHaveLength(1);
    expect(state.scenes[0].actors[0].id).toBe(actorID);
    expect(state).not.toBe(stateWithScene);
  });

  it('should handle REMOVE_ACTOR_FROM_SCENE action', () => {
    const sceneID = crypto.randomUUID();
    const actorID = crypto.randomUUID();

    const stateWithSceneAndActor = engineReducer(
      engineReducer(initial, { type: 'ADD_SCENE', scene: { id: sceneID, name: 'Level 1' } }),
      { type: 'ADD_ACTOR_TO_SCENE', payload: { sceneId: sceneID, actorProps: { id: actorID, x: 0, y: 0, width: 10, height: 10 } } }
    );
    const state = engineReducer(stateWithSceneAndActor, {
      type: 'REMOVE_ACTOR_FROM_SCENE',
      payload: { sceneId: sceneID, actorId: actorID }
    });
    expect(state.scenes[0].actors).toHaveLength(0);
    expect(state).not.toBe(stateWithSceneAndActor);
  });

  it('should handle UPDATE_ACTOR_IN_SCENE action', () => {
    const sceneID = crypto.randomUUID();
    const actorID = crypto.randomUUID();

    const stateWithSceneAndActor = engineReducer(
      engineReducer(initial, { type: 'ADD_SCENE', scene: { id: sceneID, name: 'Level 1' } }),
      { type: 'ADD_ACTOR_TO_SCENE', payload: { sceneId: sceneID, actorProps: { id: actorID, x: 0, y: 0, width: 10, height: 10 } } }
    );
    const state = engineReducer(stateWithSceneAndActor, {
      type: 'UPDATE_ACTOR_IN_SCENE',
      payload: { sceneId: sceneID, actorId: actorID, props: { x: 50 } }
    });
    expect(state.scenes[0].actors[0].x).toBe(50);
    expect(state).not.toBe(stateWithSceneAndActor);
  });

  it('should handle SET_RUNNING_STATE action', () => {
    const state = engineReducer(initial, { type: 'SET_RUNNING_STATE', runningState: true });
    expect(state.isRunning).toBe(true);
    expect(state).not.toBe(initial);
  });

  // TODO: this should mock performance.now() so we can calc differences
  it('should handle UPDATE_TIME action', () => {
    const state = engineReducer(initial, { type: 'UPDATE_TIME' });
    expect(state.deltaTime).toBe(0); // First update, deltaTime is 0
  });
});