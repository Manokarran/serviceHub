import { closestCenter, pointerWithin, type Collision, type CollisionDetection } from '@dnd-kit/core'

const BACKDROP_DROP_IDS = new Set(['canvas-drop-zone'])

function getDropTargetPriority(id: string | number): number {
  const idStr = String(id)

  if (idStr.startsWith('insert:')) {
    return 0
  }

  if (idStr.startsWith('section-drop:')) {
    return 1
  }

  if (BACKDROP_DROP_IDS.has(idStr)) {
    return 3
  }

  return 2
}

function prioritizeCollisions(collisions: Collision[]): Collision[] {
  return [...collisions].sort((a, b) => getDropTargetPriority(a.id) - getDropTargetPriority(b.id))
}

function filterBackdropUnlessOnlyOption(collisions: Collision[]): Collision[] {
  const prioritized = prioritizeCollisions(collisions.filter(collision => !BACKDROP_DROP_IDS.has(String(collision.id))))

  return prioritized.length > 0 ? prioritized : collisions
}

/** Prefer precise insert targets, then section columns, over whole-block/canvas droppables. */
export const builderCollisionDetection: CollisionDetection = args => {
  const pointerCollisions = pointerWithin(args)

  if (pointerCollisions.length > 0) {
    return filterBackdropUnlessOnlyOption(pointerCollisions)
  }

  const centerCollisions = closestCenter(args)

  return filterBackdropUnlessOnlyOption(centerCollisions)
}
