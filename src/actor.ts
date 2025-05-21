import { GameObject } from "./index";

export interface Actor extends GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  type?: string;
  [key: string]: any; // Allow for additional properties
}

export const createActor = ({ id, x = 0, y = 0, width = 0, height = 0, color = "#ffffff", type = 'generic', ...props }: Partial<Actor>) => ({
  id: id || crypto.randomUUID(),
  x, y, width, height, color, type,
  ...props
});

// Actor state transformations (pure functions)
export const moveActor = (actor: Actor, dx: number, dy: number) => ({ ...actor, x: actor.x + dx, y: actor.y + dy });
export const scaleActor = (actor: Actor, sx: number, sy: number) => ({ ...actor, width: actor.width * sx, height: actor.height * sy });
export const changeActorColor = (actor: Actor, newColor: string) => ({ ...actor, color: newColor });