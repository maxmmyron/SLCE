// tests/e2e/engine.e2e.test.js
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { createGameEngine, Engine } from '../../src/engine';
import { advanceTimeAndFrames } from '../vitest.setup';

// This file relies heavily on vitest.setup.js for mocking time and rAF

describe('Engine E2E Tests (State Evolution)', () => {
  let engine: Engine;

  beforeEach(() => {
    let canvas = document.createElement("canvas");
    engine = createGameEngine(canvas.getContext("2d")!);
  })

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  })

  it('should run game loop and update actor position over time', async () => {
    engine.dispatch({ type: 'ADD_CAMERA', camera: { id: 'e2eCam', x: 0, y: 0 } });
    engine.dispatch({ type: 'SET_ACTIVE_CAMERA', id: 'e2eCam' });
    engine.dispatch({ type: 'ADD_SCENE', scene: { id: 'e2eScene', name: 'E2E Test Scene' } });
    engine.dispatch({ type: 'SET_ACTIVE_SCENE', id: 'e2eScene' });
    engine.dispatch({
      type: 'ADD_ACTOR_TO_SCENE',
      payload: {
        sceneId: 'e2eScene',
        actorProps: { id: 'player', x: 0, y: 0, width: 10, height: 10, type: 'player' }
      }
    });

    let state = engine.getEngineState();
    expect(state.isRunning).toBe(false);
    expect(state.scenes[0].actors[0].x).toBe(0);

    engine.start();
    state = engine.getEngineState();
    expect(state.isRunning).toBe(true);

    // Simulate 1 frame (e.g., 16.66ms for 60fps, let's use 1000ms for easy math)
    await advanceTimeAndFrames(1000); // Defined in vitest.setup.js

    state = engine.getEngineState();
    expect(state.deltaTime).toBeCloseTo(1); // Should be approximately 1 second
    const playerActor = state.scenes.find(s => s.id === 'e2eScene')!.actors.find(a => a.id === 'player')!;
    expect(playerActor.x).toBeCloseTo(1); // Player moves 1 unit per second

    // Simulate another 2 seconds
    await advanceTimeAndFrames(2000);
    state = engine.getEngineState();
    expect(state.deltaTime).toBeCloseTo(2); // Delta time for *this* frame
    const playerActorAfter2s = state.scenes.find(s => s.id === 'e2eScene')!.actors.find(a => a.id === 'player')!;
    expect(playerActorAfter2s.x).toBeCloseTo(3); // Total movement 1 (from first second) + 2 (from second block of seconds) = 3

    engine.stop();
    state = engine.getEngineState();
    expect(state.isRunning).toBe(false);

    // No further changes after stopping
    await advanceTimeAndFrames(1000); // Should not advance actor position
    state = engine.getEngineState();
    const playerActorAfterStop = state.scenes.find(s => s.id === 'e2eScene')!.actors.find(a => a.id === 'player')!;
    expect(playerActorAfterStop.x).toBeCloseTo(3);
  });

  it('should correctly set active camera and scene within the loop', async () => {
    engine.dispatch({ type: 'ADD_CAMERA', camera: { id: 'cam1', x: 0, y: 0 } });
    engine.dispatch({ type: 'ADD_CAMERA', camera: { id: 'cam2', x: 100, y: 100 } });
    engine.dispatch({ type: 'ADD_SCENE', scene: { id: 'sceneA', name: 'Scene A' } });
    engine.dispatch({ type: 'ADD_SCENE', scene: { id: 'sceneB', name: 'Scene B' } });
    engine.dispatch({
      type: 'ADD_ACTOR_TO_SCENE',
      payload: { sceneId: 'sceneA', actorProps: { id: 'actorA', x: 10, y: 10, width: 10, height: 10 } }
    });
    engine.dispatch({
      type: 'ADD_ACTOR_TO_SCENE',
      payload: { sceneId: 'sceneB', actorProps: { id: 'actorB', x: 20, y: 20, width: 10, height: 10 } }
    });

    // Start with cam1 and sceneA
    engine.dispatch({ type: 'SET_ACTIVE_CAMERA', id: 'cam1' });
    engine.dispatch({ type: 'SET_ACTIVE_SCENE', id: 'sceneA' });
    engine.start();

    await advanceTimeAndFrames(100); // Run a few frames
    let state = engine.getEngineState();
    expect(state.activeCameraId).toBe('cam1');
    expect(state.activeSceneId).toBe('sceneA');
    expect(state.scenes.find(s => s.id === 'sceneA')!.actors[0].id).toBe('actorA');

    // Switch to cam2 and sceneB mid-game
    engine.dispatch({ type: 'SET_ACTIVE_CAMERA', id: 'cam2' });
    engine.dispatch({ type: 'SET_ACTIVE_SCENE', id: 'sceneB' });

    await advanceTimeAndFrames(100); // Run more frames
    state = engine.getEngineState();
    expect(state.activeCameraId).toBe('cam2');
    expect(state.activeSceneId).toBe('sceneB');
    // Ensure the current active scene is now sceneB and its actor is accessible
    expect(state.scenes.find(s => s.id === 'sceneB')!.actors[0].id).toBe('actorB');
    // Also confirm sceneA and its actor are still in the state, just not active
    expect(state.scenes.find(s => s.id === 'sceneA')!.actors[0].id).toBe('actorA');

    engine.stop();
  });

  it('should pause and resume correctly', async () => {
    const engine = createGameEngine(new CanvasRenderingContext2D());
    engine.dispatch({ type: 'ADD_CAMERA', camera: { id: 'testCam', x: 0, y: 0 } });
    engine.dispatch({ type: 'SET_ACTIVE_CAMERA', id: 'testCam' });
    engine.dispatch({ type: 'ADD_SCENE', scene: { id: 'testScene', name: 'Test Scene' } });
    engine.dispatch({ type: 'SET_ACTIVE_SCENE', id: 'testScene' });
    engine.dispatch({
      type: 'ADD_ACTOR_TO_SCENE',
      payload: { sceneId: 'testScene', actorProps: { id: 'player', x: 0, y: 0, width: 10, height: 10, type: 'player' } }
    });

    engine.start();
    await advanceTimeAndFrames(1000); // Run for 1 second
    let state = engine.getEngineState();
    expect(state.scenes[0].actors[0].x).toBeCloseTo(1);

    engine.stop();
    await advanceTimeAndFrames(1000); // Try to run for another second while stopped
    state = engine.getEngineState();
    expect(state.isRunning).toBe(false);
    expect(state.scenes[0].actors[0].x).toBeCloseTo(1); // Should not have moved further

    engine.start(); // Resume
    await advanceTimeAndFrames(1000); // Run for another second
    state = engine.getEngineState();
    expect(state.isRunning).toBe(true);
    expect(state.scenes[0].actors[0].x).toBeCloseTo(2); // Should have moved again

    engine.stop();
  });
});