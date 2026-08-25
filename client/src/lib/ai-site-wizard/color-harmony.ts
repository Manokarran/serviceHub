export type RgbColor = { r: number; g: number; b: number }

export type ThemeHarmonyPalette = {
  start: string
  end: string
  accent: string
  text: string
  muted: string
  background: string
  surface: string
  inverse: string
}

const HEX_IN_CSS = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g
const RGB_IN_CSS = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)/g

export function parseColorToRgb(value: string): RgbColor | null {
  const trimmed = value.trim()
  const hexMatch = trimmed.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)

  if (hexMatch) {
    let hex = hexMatch[1]

    if (hex.length === 3) {
      hex = hex
        .split('')
        .map(char => char + char)
        .join('')
    }

    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16)
    }
  }

  const rgbMatch = trimmed.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/)

  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3])
    }
  }

  return null
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  const clamp = (channel: number) => Math.max(0, Math.min(255, Math.round(channel)))

  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`
}

export function relativeLuminance(value: string): number {
  const rgb = parseColorToRgb(value)

  if (!rgb) {
    return 0
  }

  const channel = (component: number) => {
    const normalized = component / 255

    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}

export function isLightColor(value: string): boolean {
  return relativeLuminance(value) > 0.55
}

export function contrastTextColor(background: string, light = '#ffffff', dark = '#0f172a'): string {
  return isLightColor(background) ? dark : light
}

/** WCAG contrast ratio, 1 (identical) to 21 (black on white). */
export function contrastRatio(left: string, right: string): number {
  const lighter = Math.max(relativeLuminance(left), relativeLuminance(right))
  const darker = Math.min(relativeLuminance(left), relativeLuminance(right))

  return (lighter + 0.05) / (darker + 0.05)
}

export function mixHex(left: string, right: string, amount = 0.5): string {
  const from = parseColorToRgb(left)
  const to = parseColorToRgb(right)

  if (!from || !to) {
    return left
  }

  const blend = (start: number, end: number) => start + (end - start) * amount

  return rgbToHex({
    r: blend(from.r, to.r),
    g: blend(from.g, to.g),
    b: blend(from.b, to.b)
  })
}

function rgbToHsl({ r, g, b }: RgbColor): { h: number; s: number; l: number } {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2
  const delta = max - min

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness }
  }

  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let hue = 0

  if (max === red) {
    hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6
  } else if (max === green) {
    hue = ((blue - red) / delta + 2) / 6
  } else {
    hue = ((red - green) / delta + 4) / 6
  }

  return { h: hue, s: saturation, l: lightness }
}

function hslToRgb({ h, s, l }: { h: number; s: number; l: number }): RgbColor {
  if (s === 0) {
    const gray = l * 255

    return { r: gray, g: gray, b: gray }
  }

  const hueToChannel = (p: number, q: number, t: number) => {
    let next = t

    if (next < 0) next += 1
    if (next > 1) next -= 1
    if (next < 1 / 6) return p + (q - p) * 6 * next
    if (next < 1 / 2) return q
    if (next < 2 / 3) return p + (q - p) * (2 / 3 - next) * 6

    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  return {
    r: hueToChannel(p, q, h + 1 / 3) * 255,
    g: hueToChannel(p, q, h) * 255,
    b: hueToChannel(p, q, h - 1 / 3) * 255
  }
}

export function colorSaturation(value: string): number {
  const rgb = parseColorToRgb(value)

  return rgb ? rgbToHsl(rgb).s : 0
}

export function isChromaticColor(value: string, minimumSaturation = 0.16): boolean {
  return colorSaturation(value) >= minimumSaturation
}

export function isTransparentFill(value: unknown): boolean {
  if (typeof value !== 'string') {
    return true
  }

  const trimmed = value.trim().toLowerCase()

  return (
    !trimmed ||
    trimmed === 'transparent' ||
    trimmed === 'none' ||
    trimmed === 'inherit' ||
    trimmed === 'currentcolor' ||
    trimmed === 'rgba(0,0,0,0)' ||
    trimmed === 'hsla(0,0%,0%,0)'
  )
}

export function shiftHexToward(source: string, target: string): string {
  const from = parseColorToRgb(source)
  const to = parseColorToRgb(target)

  if (!from || !to) {
    return source
  }

  const sourceHsl = rgbToHsl(from)
  const targetHsl = rgbToHsl(to)

  if (sourceHsl.s < 0.16) {
    return source
  }

  return rgbToHex(
    hslToRgb({
      h: targetHsl.h,
      s: sourceHsl.s * 0.22 + targetHsl.s * 0.78,
      l: sourceHsl.l
    })
  )
}

export function rewriteCssColors(value: string, mapHex: (hex: string) => string): string {
  return value
    .replace(HEX_IN_CSS, match => mapHex(match))
    .replace(RGB_IN_CSS, match => {
      const rgb = parseColorToRgb(match)

      return rgb ? mapHex(rgbToHex(rgb)) : match
    })
}

export function hexDistance(left: string, right: string): number {
  const from = parseColorToRgb(left)
  const to = parseColorToRgb(right)

  if (!from || !to) {
    return Number.POSITIVE_INFINITY
  }

  return Math.abs(from.r - to.r) + Math.abs(from.g - to.g) + Math.abs(from.b - to.b)
}

export function buildThemedGradient(start: string, end: string, source?: string): string {
  const angleMatch = source?.match(/(\d+)deg/)
  const angle = angleMatch?.[1] ?? '135'

  return `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`
}
