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
      return Number.isNaN(input.getTime()) ? null : input.toISOString()
    }

    if (ancestors.has(input)) {
      return undefined
    }

    ancestors.add(input)

    try {
      const maybeToJson = input as { toJSON?: () => unknown }

      if (typeof maybeToJson.toJSON === 'function') {
        try {
          const json = maybeToJson.toJSON()

          if (json !== input) {
            return walk(json)
          }
        } catch {
          // Fall through to a field-by-field walk when toJSON() throws.
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

/** Convert Date / ISO string values without throwing on missing or invalid dates. */
export function toIsoString(value: unknown): string | null {
  if (value == null || value === '') {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value)

    return Number.isNaN(parsed.getTime()) ? value.trim() : parsed.toISOString()
  }

  if (typeof value === 'object' && typeof (value as { toISOString?: unknown }).toISOString === 'function') {
    try {
      const iso = (value as Date).toISOString()

      return typeof iso === 'string' ? iso : null
    } catch {
      return null
    }
  }

  return null
}

export function requireIsoString(value: unknown): string {
  return toIsoString(value) ?? new Date().toISOString()
}

/**
 * Produce JSON-only data safe to pass from Server Components / actions into Client Components.
 * Mongoose documents, Dates, and circular refs will crash production RSC otherwise.
 */
export function serializeForClient<T>(value: T): T {
  try {
    const plain = toPlainJson(value)

    if (plain === undefined) {
      return plain
    }

    return JSON.parse(JSON.stringify(plain)) as T
  } catch (error) {
    console.error('[serializeForClient] value is not JSON-serializable', error)

    try {
      return JSON.parse(JSON.stringify(value)) as T
    } catch {
      return value
    }
  }
}
