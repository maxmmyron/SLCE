// tests/unit/camera.test.js
import { describe, it, expect } from 'vitest';
import { createCamera, setCameraPosition, setCameraZoom, activateCamera, deactivateCamera } from '../../src/camera';

describe('Camera Unit Tests', () => {
  it('should create a camera with default and provided properties', () => {
    const camera = createCamera({ id: "cam1" });
    expect(camera).toBeDefined();
    expect(typeof camera.id).toBe('string');
    expect(camera.x).toBe(0);
    expect(camera.y).toBe(0);
    expect(camera.zoom).toBe(1);
    expect(camera.active).toBe(false); // Default is false
  });

  it('should create an active camera if specified', () => {
    const camera = createCamera({  id: "cam1", active: true  });
    expect(camera.active).toBe(true);
  });

  it('should set camera position and return a new immutable camera', () => {
    const initialCamera = createCamera({ id: "cam1" });
    const movedCamera = setCameraPosition(initialCamera, 50, 75);

    expect(movedCamera.x).toBe(50);
    expect(movedCamera.y).toBe(75);
    expect(movedCamera).not.toBe(initialCamera);
    expect(initialCamera.x).toBe(0);
  });

  it('should set camera zoom and return a new immutable camera', () => {
    const initialCamera = createCamera({ id: "cam1" });
    const zoomedCamera = setCameraZoom(initialCamera, 2.0);

    expect(zoomedCamera.zoom).toBe(2.0);
    expect(zoomedCamera).not.toBe(initialCamera);
    expect(initialCamera.zoom).toBe(1);
  });

  it('should activate a camera and return a new immutable camera', () => {
    const initialCamera = createCamera({ id: "cam1" });
    const activatedCamera = activateCamera(initialCamera);

    expect(activatedCamera.active).toBe(true);
    expect(activatedCamera).not.toBe(initialCamera);
    expect(initialCamera.active).toBe(false);
  });

  it('should deactivate a camera and return a new immutable camera', () => {
    const initialCamera = createCamera({ id: "cam1", active: true });
    const deactivatedCamera = deactivateCamera(initialCamera);

    expect(deactivatedCamera.active).toBe(false);
    expect(deactivatedCamera).not.toBe(initialCamera);
    expect(initialCamera.active).toBe(true);
  });
});