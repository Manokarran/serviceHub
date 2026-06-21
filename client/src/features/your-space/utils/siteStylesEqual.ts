import type { SiteStyles } from '../types/siteStyles'

export function siteStylesEqual(a: SiteStyles, b: SiteStyles): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
