import { removeById, updateById } from "../core/util";

export const createScene = ({ id, name, actors = [], active = false, ...props }: Partial<SLCE.Scene> & { name: string }) => ({
  id: id || crypto.randomUUID(),
  name,
  actors, // Array of actor data
  active,
  ...props
});

// Scene state transformations
export const addActorToScene = (scene: SLCE.Scene, actor: SLCE.Actor) => ({
  ...scene,
  actors: [...scene.actors, actor]
});

export const removeActorFromScene = (scene: SLCE.Scene, actorId: SLCE.Actor["id"]) => ({
  ...scene,
  actors: removeById(scene.actors, actorId)
});

export const updateActorInScene = (scene: SLCE.Scene, actorId: SLCE.Actor["id"], newActorProps: SLCE.Actor) => ({
  ...scene,
  actors: updateById<SLCE.Actor>(scene.actors, actorId, newActorProps)
});

export const activateScene = (scene: SLCE.Scene) => ({ ...scene, active: true });
export const deactivateScene = (scene: SLCE.Scene) => ({ ...scene, active: false });