export const createCamera = ({ id, x = 0, y = 0, zoom = 1, active = false }: Partial<SLCE.Camera>) => ({
  id: id || crypto.randomUUID(),
  x, y, zoom, active
});

// Camera state transformations
export const setCameraPosition = (camera: SLCE.Camera, x: number, y: number) => ({ ...camera, x, y });
export const setCameraZoom = (camera: SLCE.Camera, zoom: number) => ({ ...camera, zoom });
export const activateCamera = (camera: SLCE.Camera) => ({ ...camera, active: true });
export const deactivateCamera = (camera: SLCE.Camera) => ({ ...camera, active: false });