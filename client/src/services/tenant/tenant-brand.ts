import type { Block, CarouselBlockProps, SectionBlockProps, TabsBlockProps } from '@/features/your-space/types'
import { asBlockList, MAX_BLOCK_TREE_DEPTH } from '@/features/your-space/utils/blockList'
import type { ISitePageBlock } from '@/models/site-page'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function rewritePublicSitePrefixInValue(value: unknown, oldSlug: string, newSlug: string): unknown {
  if (oldSlug === newSlug) {
    return value
  }

  const oldPrefix = `/site/${oldSlug}`
  const newPrefix = `/site/${newSlug}`

  const walk = (input: unknown, depth = 0): unknown => {
    if (depth > 40) {
      return input
    }

    if (typeof input === 'string') {
      if (
        input === oldPrefix ||
        input.startsWith(`${oldPrefix}/`) ||
        input.startsWith(`${oldPrefix}?`) ||
        input.startsWith(`${oldPrefix}#`)
      ) {
        return `${newPrefix}${input.slice(oldPrefix.length)}`
      }

      return input
    }

    if (Array.isArray(input)) {
      return input.map(item => walk(item, depth + 1))
    }

    if (input && typeof input === 'object') {
      const output: Record<string, unknown> = {}

      for (const [key, nested] of Object.entries(input as Record<string, unknown>)) {
        output[key] = walk(nested, depth + 1)
      }

      return output
    }

    return input
  }

  return walk(value)
}

export function rewritePublicSiteSlugInBlocks(
  blocks: unknown,
  oldSlug: string,
  newSlug: string
): ISitePageBlock[] {
  return rewritePublicSitePrefixInValue(blocks, oldSlug, newSlug) as ISitePageBlock[]
}

type CompanyBrandOptions = {
  previousName: string
  nextName: string
  previousLogoUrl: string
  nextLogoUrl?: string
}

function applyBrandToBlockList(blocks: unknown, options: CompanyBrandOptions, depth = 0): Block[] {
  if (depth > MAX_BLOCK_TREE_DEPTH) {
    return []
  }

  const nameChanged = options.previousName.trim() !== options.nextName.trim()

  return asBlockList(blocks).map(block => {
    const props = { ...asRecord(block.props) }

    if (block.type === 'header' || block.type === 'footer') {
      const logoText = typeof props.logoText === 'string' ? props.logoText : ''

      if (nameChanged && (!logoText.trim() || logoText.trim() === options.previousName.trim())) {
        props.logoText = options.nextName
      }

      if (options.nextLogoUrl !== undefined) {
        if (options.nextLogoUrl) {
          props.logoUrl = options.nextLogoUrl
        } else if (typeof props.logoUrl === 'string' && props.logoUrl === options.previousLogoUrl) {
          props.logoUrl = ''
        }
      }

      if (block.type === 'footer' && nameChanged && typeof props.copyrightText === 'string' && options.previousName.trim()) {
        props.copyrightText = props.copyrightText.replaceAll(options.previousName, options.nextName)
      }
    }

    if (block.type === 'logo' && options.nextLogoUrl !== undefined) {
      const src = typeof props.src === 'string' ? props.src : ''

      if (options.nextLogoUrl && (!src.trim() || src === options.previousLogoUrl)) {
        props.src = options.nextLogoUrl

        if (!props.alt) {
          props.alt = options.nextName
        }
      } else if (!options.nextLogoUrl && src === options.previousLogoUrl) {
        props.src = ''
      }
    }

    if (block.type === 'section') {
      const section = props as unknown as SectionBlockProps
      const cache = new Map<unknown, Block[]>()

      const applyList = (value: unknown) => {
        if (cache.has(value)) {
          return cache.get(value) as Block[]
        }

        const mapped = applyBrandToBlockList(value, options, depth + 1)

        cache.set(value, mapped)

        return mapped
      }

      return {
        id: block.id,
        type: block.type,
        props: {
          ...section,
          children: applyList(section.children),
          primaryChildren: applyList(section.primaryChildren),
          secondaryChildren: applyList(section.secondaryChildren)
        } as Block['props']
      }
    }

    if (block.type === 'carousel') {
      const carousel = props as unknown as CarouselBlockProps

      return {
        id: block.id,
        type: block.type,
        props: {
          ...carousel,
          slides: (carousel.slides ?? []).map(slide => ({
            ...slide,
            children: applyBrandToBlockList(slide.children, options, depth + 1)
          }))
        } as Block['props']
      }
    }

    if (block.type === 'tabs') {
      const tabs = props as unknown as TabsBlockProps

      return {
        id: block.id,
        type: block.type,
        props: {
          ...tabs,
          tabs: (tabs.tabs ?? []).map(panel => ({
            ...panel,
            children: applyBrandToBlockList(panel.children, options, depth + 1)
          }))
        } as Block['props']
      }
    }

    return { id: block.id, type: block.type, props: props as unknown as Block['props'] }
  })
}

export function applyCompanyBrandToBlocks(blocks: unknown, options: CompanyBrandOptions): ISitePageBlock[] {
  return applyBrandToBlockList(blocks, options) as unknown as ISitePageBlock[]
}

export function blocksJsonEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}
