import type { Block } from '../types'

export const MAX_BLOCK_TREE_DEPTH = 24

export function asBlockList(value: unknown): Block[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(
    (item): item is Block => Boolean(item) && typeof item === 'object' && typeof (item as Block).type === 'string'
  )
}
