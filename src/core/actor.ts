export const createActor = ({ id, x = 0, y = 0, width = 0, height = 0, color = "#ffffff", type = 'generic', ...props }: Partial<SLCE.Actor>) => ({
  id: id || crypto.randomUUID(),
  x, y, width, height, color, type,
  ...props
});

// Actor state transformations (pure functions)
export const moveActor = (actor: SLCE.Actor, dx: number, dy: number) => ({ ...actor, x: actor.x + dx, y: actor.y + dy });
export const scaleActor = (actor: SLCE.Actor, sx: number, sy: number) => ({ ...actor, width: actor.width * sx, height: actor.height * sy });
export const changeActorColor = (actor: SLCE.Actor, newColor: string) => ({ ...actor, color: newColor });