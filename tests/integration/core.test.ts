// tests/integration/core.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { createGameEngine, Engine } from '../../src/engine';
import { createActor } from '../../src/actor'; // Not mocked for integration, actual import
import { createCamera } from '../../src/camera'; // Not mocked for integration, actual import
import { createScene } from '../../src/scene';   // Not mocked for integration, actual import

describe('Core Engine Integration Tests', () => {
  let engine: Engine;

  beforeEach(() => {
    let canvas = document.createElement("canvas");
    engine = createGameEngine(canvas.getContext("2d")!);
  })

  it('should dispatch actions and update engine state correctly', () => {
    let state = engine.getEngineState();

    // 1. Add Camera
    engine.dispatch({ type: 'ADD_CAMERA', camera: { id: 'mainCam', x: 0, y: 0 } });
    state = engine.getEngineState();
    expect(state.cameras).toHaveLength(1);
    expect(state.cameras[0].id).toBe('mainCam');

    // 2. Set Active Camera
    engine.dispatch({ type: 'SET_ACTIVE_CAMERA', id: 'mainCam' });
    state = engine.getEngineState();
    expect(state.activeCameraId).toBe('mainCam');
    expect(state.cameras[0].active).toBe(true);

    // 3. Add Scene
    engine.dispatch({ type: 'ADD_SCENE', scene: { id: 'level1', name: 'Forest' } });
    state = engine.getEngineState();
    expect(state.scenes).toHaveLength(1);
    expect(state.scenes[0].id).toBe('level1');

    // 4. Set Active Scene
    engine.dispatch({ type: 'SET_ACTIVE_SCENE', id: 'level1' });
    state = engine.getEngineState();
    expect(state.activeSceneId).toBe('level1');
    expect(state.scenes[0].active).toBe(true);

    // 5. Add Actor to Active Scene
    engine.dispatch({
      type: 'ADD_ACTOR_TO_SCENE',
      payload: { sceneId: 'level1', actorProps: { id: 'player1', x: 50, y: 50, width: 20, height: 20, color: 'blue' } }
    });
    state = engine.getEngineState();
    expect(state.scenes[0].actors).toHaveLength(1);
    expect(state.scenes[0].actors[0].id).toBe('player1');
    expect(state.scenes[0].actors[0].x).toBe(50);

    // 6. Update Actor in Active Scene
    engine.dispatch({
      type: 'UPDATE_ACTOR_IN_SCENE',
      payload: { sceneId: 'level1', actorId: 'player1', props: { x: 100, color: 'green' } }
    });
    state = engine.getEngineState();
    expect(state.scenes[0].actors[0].x).toBe(100);
    expect(state.scenes[0].actors[0].color).toBe('green');
  });

  it('should correctly handle activation/deactivation of cameras/scenes', () => {
    const [cId1, cId2, sId1, sId2] = [crypto.randomUUID(),crypto.randomUUID(),crypto.randomUUID(),crypto.randomUUID()];

    engine.dispatch({ type: 'ADD_CAMERA', camera: { id: cId1, x: 0, y: 0 } });
    engine.dispatch({ type: 'ADD_CAMERA', camera: { id: cId2, x: 0, y: 0 } });
    engine.dispatch({ type: 'ADD_SCENE', scene: { id: sId1, name: 'Scene 1' } });
    engine.dispatch({ type: 'ADD_SCENE', scene: { id: sId2, name: 'Scene 2' } });

    // Set cam1 and s1 active
    engine.dispatch({ type: 'SET_ACTIVE_CAMERA', id: cId1 });
    engine.dispatch({ type: 'SET_ACTIVE_SCENE', id: sId1 });
    let state = engine.getEngineState();
    expect(state.cameras.find(c => c.id === cId1)!.active).toBe(true);
    expect(state.cameras.find(c => c.id === cId2)!.active).toBe(false);
    expect(state.scenes.find(s => s.id === sId1)!.active).toBe(true);
    expect(state.scenes.find(s => s.id === sId2)!.active).toBe(false);

    // Switch to cam2 and s2
    engine.dispatch({ type: 'SET_ACTIVE_CAMERA', id: cId2 });
    engine.dispatch({ type: 'SET_ACTIVE_SCENE', id: sId2 });
    state = engine.getEngineState();
    expect(state.cameras.find(c => c.id === cId1)!.active).toBe(false); // Old one deactivated
    expect(state.cameras.find(c => c.id === cId2)!.active).toBe(true);  // New one activated
    expect(state.scenes.find(s => s.id === sId1)!.active).toBe(false);
    expect(state.scenes.find(s => s.id === sId2)!.active).toBe(true);
  });
});