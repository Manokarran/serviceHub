/** Strip Mongoose wrappers and break true circular refs without collapsing shared (DAG) objects. */
export function toPlainJson<T>(value: T): T {
  if (value === undefined) {
    return value
  }

  const ancestors = new WeakSet<object>()

  const walk = (input: unknown): unknown => {
    if (input === null || typeof input !== 'object') {
      return input
    }

    if (input instanceof Date) {
      return input.toISOString()
    }

    if (ancestors.has(input)) {
      return undefined
    }

    ancestors.add(input)

    try {
      const maybeToJson = input as { toJSON?: () => unknown }

      if (typeof maybeToJson.toJSON === 'function') {
        const json = maybeToJson.toJSON()

        if (json !== input) {
          return walk(json)
        }
      }

      if (Array.isArray(input)) {
        return input.map(item => walk(item)).filter(item => item !== undefined)
      }

      const output: Record<string, unknown> = {}

      for (const [key, nested] of Object.entries(input as Record<string, unknown>)) {
        if (key.startsWith('$') || key === '__v' || key === '_doc') {
          continue
        }

        const next = walk(nested)

        if (next !== undefined) {
          output[key] = next
        }
      }

      return output
    } finally {
      ancestors.delete(input)
    }
  }

  return walk(value) as T
}
