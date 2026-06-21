/** Sanitizes slug input while typing; keeps trailing hyphens so users can type `my-company`. */
export function sanitizeSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 63)
}

export function slugify(value: string): string {
  return sanitizeSlugInput(value.trim().replace(/\s+/g, '-')).replace(/^-|-$/g, '')
}
