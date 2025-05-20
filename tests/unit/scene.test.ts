// tests/unit/scene.test.js
import { describe, it, expect } from 'vitest';
import { createScene, addActorToScene, removeActorFromScene, updateActorInScene, activateScene, deactivateScene } from '../../src/core/scene';
import { createActor } from '../../src/core/actor';

describe('Scene Unit Tests', () => {
  it('should create a scene with default and provided properties', () => {
    const scene = createScene({ name: 'My Level' });
    expect(scene).toBeDefined();
    expect(typeof scene.id).toBe('string');
    expect(scene.name).toBe('My Level');
    expect(scene.actors).toEqual([]);
    expect(scene.active).toBe(false);
  });

  it('should create an active scene if specified', () => {
    const scene = createScene({ name: 'Active Level', active: true });
    expect(scene.active).toBe(true);
  });

  it('should add an actor to a scene and return a new immutable scene', () => {
    const initialScene = createScene({ name: 'Test Scene' });
    const actor1 = createActor({ x: 10, y: 10, width: 10, height: 10 });
    const updatedScene = addActorToScene(initialScene, actor1);

    expect(updatedScene.actors).toHaveLength(1);
    expect(updatedScene.actors[0]).toBe(actor1); // Check reference equality for added actor
    expect(updatedScene).not.toBe(initialScene);
    expect(initialScene.actors).toHaveLength(0); // Original scene unchanged
  });

  it('should remove an actor from a scene and return a new immutable scene', () => {
    const actor1ID = crypto.randomUUID();
    const actor2ID = crypto.randomUUID();

    const actor1 = createActor({ id: actor1ID, x: 10, y: 10, width: 10, height: 10 });
    const actor2 = createActor({ id: actor2ID, x: 20, y: 20, width: 10, height: 10 });
    const initialScene = createScene({ name: 'Test Scene', actors: [actor1, actor2] });
    const updatedScene = removeActorFromScene(initialScene, actor1ID);

    expect(updatedScene.actors).toHaveLength(1);
    expect(updatedScene.actors[0].id).toBe(actor2ID);
    expect(updatedScene).not.toBe(initialScene);
    expect(initialScene.actors).toHaveLength(2);
  });

  it('should update an actor in a scene and return a new immutable scene', () => {
    const actor1ID = crypto.randomUUID();
    const actor1 = createActor({ id: actor1ID, x: 10, y: 10, width: 10, height: 10, color: 'blue' });
    const initialScene = createScene({ name: 'Test Scene', actors: [actor1] });
    const updatedScene = updateActorInScene(initialScene, actor1ID, { ...actor1, x: 100, color: 'green' });

    expect(updatedScene.actors).toHaveLength(1);
    expect(updatedScene.actors[0].id).toBe(actor1ID);
    expect(updatedScene.actors[0].x).toBe(100);
    expect(updatedScene.actors[0].color).toBe('green');
    expect(updatedScene.actors[0].y).toBe(10); // Unchanged properties remain
    expect(updatedScene.actors[0]).not.toBe(actor1); // Actor itself should be new immutable object
    expect(updatedScene).not.toBe(initialScene);
    expect(initialScene.actors[0].x).toBe(10); // Original actor unchanged
  });

  it('should activate a scene and return a new immutable scene', () => {
    const initialScene = createScene({ name: 'Test', active: false });
    const activatedScene = activateScene(initialScene);

    expect(activatedScene.active).toBe(true);
    expect(activatedScene).not.toBe(initialScene);
    expect(initialScene.active).toBe(false);
  });

  it('should deactivate a scene and return a new immutable scene', () => {
    const initialScene = createScene({ name: 'Test', active: true });
    const deactivatedScene = deactivateScene(initialScene);

    expect(deactivatedScene.active).toBe(false);
    expect(deactivatedScene).not.toBe(initialScene);
    expect(initialScene.active).toBe(true);
  });
});