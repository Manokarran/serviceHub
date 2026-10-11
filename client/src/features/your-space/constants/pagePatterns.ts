import { LATTICE_SVG } from './latticeSvg'

export const PAGE_PATTERN_IDS = [
  'none',
  'lattice',
  'dots',
  'grid',
  'diagonal',
  'crosshatch',
  'plus',
  'waves',
  'hex',
  'circuit',
  'chevron',
  'rings',
  'topography'
] as const

export type PagePatternId = (typeof PAGE_PATTERN_IDS)[number]

export type PagePatternScope = 'site' | 'page'

export interface PagePatternConfig {
  pattern: PagePatternId

  /** 0–100. How visible the lines are when the page loads. */
  loadStrength: number

  /** 0–100. How visible the lines become under the pointer. */
  hoverStrength: number
}

export const DEFAULT_PAGE_PATTERN_LOAD = 18
export const DEFAULT_PAGE_PATTERN_HOVER = 55

export const PAGE_PATTERN_OPTIONS: { id: PagePatternId; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'lattice', label: 'Lattice' },
  { id: 'dots', label: 'Dots' },
  { id: 'grid', label: 'Grid' },
  { id: 'diagonal', label: 'Diagonal' },
  { id: 'crosshatch', label: 'Crosshatch' },
  { id: 'plus', label: 'Plus' },
  { id: 'waves', label: 'Waves' },
  { id: 'hex', label: 'Hexagons' },
  { id: 'circuit', label: 'Circuit' },
  { id: 'chevron', label: 'Chevron' },
  { id: 'rings', label: 'Rings' },
  { id: 'topography', label: 'Topography' }
]

export interface PagePatternPaint {
  backgroundImage: string
  backgroundSize: string
}

const paintCache = new Map<string, PagePatternPaint>()

function patternColor(color: string): string {
  const trimmed = color.trim()

  if (!trimmed || /["'<>]/.test(trimmed)) {
    return '#18181b'
  }

  return trimmed
}

function coloredTile(svg: string, width: number, height: number, color: string): PagePatternPaint {
  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg.replaceAll('__COLOR__', color))}")`,
    backgroundSize: `${width}px ${height}px`
  }
}

function latticePaint(color: string): PagePatternPaint {
  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(LATTICE_SVG.replaceAll('#78512D', color))}")`,
    backgroundSize: '101px 58px'
  }
}

export function isPagePatternId(value: unknown): value is PagePatternId {
  return typeof value === 'string' && (PAGE_PATTERN_IDS as readonly string[]).includes(value)
}

export function getPagePatternLabel(id: PagePatternId): string {
  return PAGE_PATTERN_OPTIONS.find(option => option.id === id)?.label ?? 'None'
}

/** Line art in `color`, transparent everywhere else, so the page shows through. */
export function getPagePatternPaint(id: PagePatternId, color: string): PagePatternPaint | null {
  if (id === 'none') {
    return null
  }

  const ink = patternColor(color)
  const key = `${id}|${ink}`
  const cached = paintCache.get(key)

  if (cached) {
    return cached
  }

  const paint = buildPagePatternPaint(id, ink)

  paintCache.set(key, paint)

  return paint
}

function buildPagePatternPaint(id: Exclude<PagePatternId, 'none'>, color: string): PagePatternPaint {
  switch (id) {
    case 'lattice':
      return latticePaint(color)
    case 'dots':
      return coloredTile(
        `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><circle cx="1.4" cy="1.4" r="1.15" fill="__COLOR__"/></svg>`,
        18,
        18,
        color
      )
    case 'grid':
      return coloredTile(
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M24 0H0V1H24zM0 0H1V24H0z" fill="__COLOR__"/></svg>`,
        24,
        24,
        color
      )
    case 'diagonal':
      return coloredTile(
        `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><path d="M-2 2 L2 -2 M0 12 L12 0 M10 14 L14 10" fill="none" stroke="__COLOR__" stroke-width="1"/></svg>`,
        12,
        12,
        color
      )
    case 'crosshatch':
      return coloredTile(
        `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><path d="M-2 2 L2 -2 M0 12 L12 0 M10 14 L14 10 M-2 10 L2 14 M0 0 L12 12 M10 -2 L14 2" fill="none" stroke="__COLOR__" stroke-width="1"/></svg>`,
        12,
        12,
        color
      )
    case 'plus':
      return coloredTile(
        `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"><path d="M10 4h2v6h6v2h-6v6h-2v-6H4v-2h6z" fill="__COLOR__"/></svg>`,
        22,
        22,
        color
      )
    case 'waves':
      return coloredTile(
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="16"><path d="M0 8 Q12 1 24 8 T48 8" fill="none" stroke="__COLOR__" stroke-width="1.15"/></svg>`,
        48,
        16,
        color
      )
    case 'hex':
      return coloredTile(
        `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="24"><path d="M7 1h14l6 11-6 11H7L1 12z" fill="none" stroke="__COLOR__" stroke-width="1"/></svg>`,
        28,
        24,
        color
      )
    case 'circuit':
      return coloredTile(
        `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M0 16h12v-8h8v8h12M16 0v12h8v8h-8v12" fill="none" stroke="__COLOR__" stroke-width="1"/><circle cx="16" cy="16" r="1.7" fill="__COLOR__"/></svg>`,
        32,
        32,
        color
      )
    case 'chevron':
      return coloredTile(
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="12"><path d="M0 12 L12 1 L24 12" fill="none" stroke="__COLOR__" stroke-width="1"/></svg>`,
        24,
        12,
        color
      )
    case 'rings':
      return coloredTile(
        `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46"><circle cx="0" cy="0" r="10" fill="none" stroke="__COLOR__" stroke-width="1"/><circle cx="0" cy="0" r="18" fill="none" stroke="__COLOR__" stroke-width="1"/><circle cx="46" cy="46" r="10" fill="none" stroke="__COLOR__" stroke-width="1"/><circle cx="46" cy="46" r="18" fill="none" stroke="__COLOR__" stroke-width="1"/></svg>`,
        46,
        46,
        color
      )
    case 'topography':
      return coloredTile(
        `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><path d="M0 20c10-8 20 8 32 0s22-8 32 0M0 36c10-8 20 8 32 0s22-8 32 0M0 52c10-8 20 8 32 0s22-8 32 0" fill="none" stroke="__COLOR__" stroke-width="1"/></svg>`,
        64,
        64,
        color
      )
    default:
      return latticePaint(color)
  }
}

/** Resting visibility. 18 matches the soft lattice on the reference landing page. */
export function pagePatternLoadOpacity(strength: number): number {
  return (clampPatternStrength(strength) / 100) * 0.45
}

/** Pointer light. 55 matches the landing-page shine. */
export function pagePatternHoverOpacity(strength: number): number {
  return (clampPatternStrength(strength) / 100) * 0.95
}

export function clampPatternStrength(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}
