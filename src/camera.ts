import { GameObject } from "./index";

export interface Camera extends GameObject {
  x: number;
  y: number;
  zoom: number;
  active: boolean;
}

let defaultCam: Camera = {
  id: "",
  x: 0,
  y: 0,
  zoom: 1,
  active: false,
}

export const createCamera = (opts: Partial<Camera> & { id: string }): Camera => ({
  ...defaultCam,
  ...opts
});

// Camera state transformations
export const setCameraPosition = (camera: Camera, x: number, y: number) => ({ ...camera, x, y });
export const setCameraZoom = (camera: Camera, zoom: number) => ({ ...camera, zoom });
export const activateCamera = (camera: Camera) => ({ ...camera, active: true });
export const deactivateCamera = (camera: Camera) => ({ ...camera, active: false });