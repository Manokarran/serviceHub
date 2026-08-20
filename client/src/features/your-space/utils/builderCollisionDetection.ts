import {
  closestCenter,
  pointerWithin,
  type Collision,
  type CollisionDetection,
  type CollisionDetectionArgs,
  type ClientRect
} from '@dnd-kit/core'

const BACKDROP_DROP_IDS = new Set(['canvas-drop-zone'])

function getDropTargetPriority(id: string | number): number {
  const idStr = String(id)

  if (idStr.startsWith('insert:')) {
    return 0
  }

  if (idStr === 'canvas-append-zone') {
    return 0
  }

  if (idStr.startsWith('carousel-drop:')) {
    return 1
  }

  if (idStr.startsWith('tabs-drop:')) {
    return 1
  }

  if (idStr.startsWith('section-drop:')) {
    return 1
  }

  if (BACKDROP_DROP_IDS.has(idStr)) {
    return 3
  }

  return 2
}

function isPointInsideRect(x: number, y: number, rect: ClientRect): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

function rectArea(rect: ClientRect): number {
  return Math.max(rect.width, 1) * Math.max(rect.height, 1)
}

function rectContains(outer: ClientRect, inner: ClientRect): boolean {
  return (
    inner.left >= outer.left - 0.5 &&
    inner.right <= outer.right + 0.5 &&
    inner.top >= outer.top - 0.5 &&
    inner.bottom <= outer.bottom + 0.5 &&
    rectArea(inner) < rectArea(outer)
  )
}

/** How many other droppables in this collision set fully wrap this rect — deeper nests score higher. */
function getContainmentDepth(
  id: string | number,
  collisions: Collision[],
  droppableRects: CollisionDetectionArgs['droppableRects']
): number {
  const rect = droppableRects.get(id)

  if (!rect) {
    return 0
  }

  let depth = 0

  for (const collision of collisions) {
    if (collision.id === id) {
      continue
    }

    const other = droppableRects.get(collision.id)

    if (other && rectContains(other, rect)) {
      depth += 1
    }
  }

  return depth
}

function getCollisionSortScore(
  id: string | number,
  collisions: Collision[],
  droppableRects: CollisionDetectionArgs['droppableRects'],
  pointerCoordinates: CollisionDetectionArgs['pointerCoordinates']
): number {
  const priority = getDropTargetPriority(id)
  const rect = droppableRects.get(id)

  if (!rect || !pointerCoordinates) {
    return priority * 1e12
  }

  const { x, y } = pointerCoordinates
  const inside = isPointInsideRect(x, y, rect)
  const area = rectArea(rect)
  const centerDistance = Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2))
  const depth = getContainmentDepth(id, collisions, droppableRects)

  if (!inside) {
    // Prefer nearer off-target only as a last resort
    return priority * 1e12 + 1e9 + centerDistance
  }

  // Inside pointer: prefer precise inserts, then deeper nests, then closer centers, then smaller rects.
  // Depth is subtracted so nested section rows beat parent column shells.
  return priority * 1e12 - depth * 1e9 + centerDistance * 1e3 + area * 0.01
}

export function rankBuilderCollisions(
  collisions: Collision[],
  args: Pick<CollisionDetectionArgs, 'droppableRects' | 'pointerCoordinates'>
): Collision[] {
  return [...collisions].sort(
    (a, b) =>
      getCollisionSortScore(a.id, collisions, args.droppableRects, args.pointerCoordinates) -
      getCollisionSortScore(b.id, collisions, args.droppableRects, args.pointerCoordinates)
  )
}

function filterBackdropUnlessOnlyOption(collisions: Collision[]): Collision[] {
  const filtered = collisions.filter(collision => !BACKDROP_DROP_IDS.has(String(collision.id)))

  return filtered.length > 0 ? filtered : collisions
}

/** Pick the best droppable id from drag-end collisions (same ranking as live collision detection). */
export function pickPreferredDropTargetId(
  overId: string | number | undefined,
  collisions: Collision[] | null | undefined
): string | number | undefined {
  if (collisions && collisions.length > 0) {
    return collisions[0].id
  }

  return overId
}

/** Prefer precise insert targets, then deepest nested slots under the pointer. */
export const builderCollisionDetection: CollisionDetection = args => {
  const pointerCollisions = pointerWithin(args)
  const collisions = pointerCollisions.length > 0 ? pointerCollisions : closestCenter(args)
  const filtered = filterBackdropUnlessOnlyOption(collisions)

  return rankBuilderCollisions(filtered, args)
}
