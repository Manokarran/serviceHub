import { closestCenter, pointerWithin, type CollisionDetection } from '@dnd-kit/core'

const BACKDROP_DROP_IDS = new Set(['canvas-drop-zone'])

/** Prefer precise block/insert targets over the full-canvas backdrop droppable. */
export const builderCollisionDetection: CollisionDetection = args => {
  const pointerCollisions = pointerWithin(args)

  if (pointerCollisions.length > 0) {
    const prioritized = pointerCollisions.filter(collision => !BACKDROP_DROP_IDS.has(String(collision.id)))

    return prioritized.length > 0 ? prioritized : pointerCollisions
  }

  const centerCollisions = closestCenter(args)
  const prioritized = centerCollisions.filter(collision => !BACKDROP_DROP_IDS.has(String(collision.id)))

  return prioritized.length > 0 ? prioritized : centerCollisions
}
