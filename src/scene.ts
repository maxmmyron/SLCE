import type { Actor, GameObject } from "./index";
import { removeById, updateById } from "./util";

export interface Scene extends GameObject {
  name: string;
  actors: Actor[];
  active: boolean;
  [key: string]: any; // Allow for additional properties
}

export const createScene = ({ id, name, actors = [], active = false, ...props }: Partial<Scene> & { name: string }) => ({
  id: id || crypto.randomUUID(),
  name,
  actors, // Array of actor data
  active,
  ...props
});

// Scene state transformations
export const addActorToScene = (scene: Scene, actor: Actor) => ({
  ...scene,
  actors: [...scene.actors, actor]
});

export const removeActorFromScene = (scene: Scene, actorId: Actor["id"]) => ({
  ...scene,
  actors: removeById(scene.actors, actorId)
});

export const updateActorInScene = (scene: Scene, actorId: Actor["id"], newActorProps: Actor) => ({
  ...scene,
  actors: updateById<Actor>(scene.actors, actorId, newActorProps)
});

export const activateScene = (scene: Scene) => ({ ...scene, active: true });
export const deactivateScene = (scene: Scene) => ({ ...scene, active: false });