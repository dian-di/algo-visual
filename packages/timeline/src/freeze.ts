/**
 * Recursively freeze an object and all nested properties.
 *
 * Returns the same reference (idempotent — safe to call on already-frozen objects).
 * Skips functions and symbols.
 */
export function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (Object.isFrozen(obj)) return obj

  // Freeze all own properties first (handles arrays and objects uniformly)
  const keys = Reflect.ownKeys(obj as object)
  for (const key of keys) {
    const value = (obj as Record<string | symbol, unknown>)[key]
    if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  }

  return Object.freeze(obj)
}
