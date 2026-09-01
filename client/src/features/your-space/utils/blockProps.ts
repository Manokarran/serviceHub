import type { Block } from '../types'

/**
 * Block props are a discriminated union keyed by block type. Code that patches
 * props generically has to step through `unknown` to cross that boundary, so it
 * lives here instead of being repeated as a double cast at every call site.
 */
export function readBlockProps(props: Block['props'] | undefined): Record<string, unknown> {
  return (props ?? {}) as unknown as Record<string, unknown>
}

export function asBlockProps(props: Record<string, unknown>): Block['props'] {
  return props as unknown as Block['props']
}
