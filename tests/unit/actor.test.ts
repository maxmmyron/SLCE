// tests/unit/actor.test.js
import { describe, it, expect } from 'vitest';
import { createActor, moveActor, scaleActor, changeActorColor } from '../../src/actor';

describe('Actor Unit Tests', () => {
  it('should create an actor with default and provided properties', () => {
    const actor = createActor({ x: 10, y: 20, width: 30, height: 40, color: 'red' });
    expect(actor).toBeDefined();
    expect(typeof actor.id).toBe('string');
    expect(actor.x).toBe(10);
    expect(actor.y).toBe(20);
    expect(actor.width).toBe(30);
    expect(actor.height).toBe(40);
    expect(actor.color).toBe('red');
    expect(actor.type).toBe('generic');
  });

  it('should create an actor with custom type', () => {
    const actor = createActor({ x: 0, y: 0, width: 10, height: 10, type: 'player', speed: 5 });
    expect(actor.type).toBe('player');
  });

  it('should move an actor and return a new immutable actor', () => {
    const initialActor = createActor({ x: 0, y: 0, width: 10, height: 10 });
    const movedActor = moveActor(initialActor, 5, 10);

    expect(movedActor.x).toBe(5);
    expect(movedActor.y).toBe(10);
    expect(movedActor).not.toBe(initialActor); // Ensure immutability
    expect(initialActor.x).toBe(0); // Original actor should be unchanged
  });

  it('should scale an actor and return a new immutable actor', () => {
    const initialActor = createActor({ x: 0, y: 0, width: 10, height: 20 });
    const scaledActor = scaleActor(initialActor, 2, 0.5);

    expect(scaledActor.width).toBe(20);
    expect(scaledActor.height).toBe(10);
    expect(scaledActor).not.toBe(initialActor);
    expect(initialActor.width).toBe(10);
  });

  it('should change actor color and return a new immutable actor', () => {
    const initialActor = createActor({ x: 0, y: 0, width: 10, height: 10, color: 'blue' });
    const changedActor = changeActorColor(initialActor, 'green');

    expect(changedActor.color).toBe('green');
    expect(changedActor).not.toBe(initialActor);
    expect(initialActor.color).toBe('blue');
  });
});