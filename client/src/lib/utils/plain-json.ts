/** Strip Mongoose document wrappers / circular refs for server actions and client state. */
export function toPlainJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
