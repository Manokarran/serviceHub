import type { Block } from '@/features/your-space/types'

export function serializeBlocks(blocks: Block[]): string {
  return JSON.stringify(blocks)
}

export function blocksEqual(a: Block[], b: Block[]): boolean {
  return serializeBlocks(a) === serializeBlocks(b)
}
