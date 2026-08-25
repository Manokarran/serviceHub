import type {
  Block,
  CarouselBlockProps,
  HeaderBlockProps,
  ImageContinuousAnimation,
  ImageEntranceAnimation,
  ImageHoverEffect,
  SectionBlockProps,
  ShowcaseBlockProps,
  TabsBlockProps
} from '@/features/your-space/types'
import { asBlockList, MAX_BLOCK_TREE_DEPTH } from '@/features/your-space/utils/blockList'
import { isSimpleColor } from '@/features/your-space/utils/sectionStyleHelpers'

export type MediaSlotKind = 'image' | 'background' | 'showcase' | 'logo'

export type BlockMediaSlot = {
  path: string
  kind: MediaSlotKind
  currentUrl: string
  queryHint: string
}

export type MediaFill = {
  url: string
  alt: string
  hoverEffect: ImageHoverEffect
  entranceAnimation: ImageEntranceAnimation
  continuousAnimation: ImageContinuousAnimation
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function walkNestedSectionLists(
  section: SectionBlockProps,
  pageSlug: string,
  prefix: string,
  index: number,
  visit: (block: Block, path: string, props: Record<string, unknown>) => void,
  depth: number,
  visiting: WeakSet<object>
) {
  const lists: Array<[unknown, string]> = [
    [section.children, `${prefix}/${index}/children`],
    [section.primaryChildren, `${prefix}/${index}/primary`],
    [section.secondaryChildren, `${prefix}/${index}/secondary`]
  ]
  const seen = new Set<unknown>()

  for (const [list, nextPrefix] of lists) {
    if (seen.has(list)) {
      continue
    }

    seen.add(list)
    walkBlocks(list, pageSlug, nextPrefix, visit, depth, visiting)
  }
}

function mapNestedSectionLists(
  section: SectionBlockProps,
  pageSlug: string,
  prefix: string,
  index: number,
  mapper: (block: Block, path: string, props: Record<string, unknown>) => Record<string, unknown>,
  depth: number,
  visiting: WeakSet<object>
): Pick<SectionBlockProps, 'children' | 'primaryChildren' | 'secondaryChildren'> {
  const cache = new Map<unknown, Block[]>()

  const mapList = (value: unknown, nextPrefix: string) => {
    if (cache.has(value)) {
      return cache.get(value) as Block[]
    }

    const mapped = mapBlocks(value, pageSlug, nextPrefix, mapper, depth, visiting)
    cache.set(value, mapped)

    return mapped
  }

  return {
    children: mapList(section.children, `${prefix}/${index}/children`),
    primaryChildren: mapList(section.primaryChildren, `${prefix}/${index}/primary`),
    secondaryChildren: mapList(section.secondaryChildren, `${prefix}/${index}/secondary`)
  }
}

function walkBlocks(
  blocks: unknown,
  pageSlug: string,
  prefix: string,
  visit: (block: Block, path: string, props: Record<string, unknown>) => void,
  depth = 0,
  visiting = new WeakSet<object>()
) {
  if (depth > MAX_BLOCK_TREE_DEPTH) {
    return
  }

  asBlockList(blocks).forEach((block, index) => {
    if (visiting.has(block)) {
      return
    }

    visiting.add(block)

    try {
      const path = `${pageSlug}${prefix}/${index}`
      const props = asRecord(block.props)

      visit(block, path, props)

      if (block.type === 'section') {
        walkNestedSectionLists(props as unknown as SectionBlockProps, pageSlug, prefix, index, visit, depth + 1, visiting)
      }

      if (block.type === 'carousel') {
        const carousel = props as unknown as CarouselBlockProps
        carousel.slides?.forEach((slide, slideIndex) => {
          walkBlocks(slide.children, pageSlug, `${prefix}/${index}/slide/${slideIndex}`, visit, depth + 1, visiting)
        })
      }

      if (block.type === 'tabs') {
        const tabs = props as unknown as TabsBlockProps
        tabs.tabs?.forEach((panel, panelIndex) => {
          walkBlocks(panel.children, pageSlug, `${prefix}/${index}/tab/${panelIndex}`, visit, depth + 1, visiting)
        })
      }
    } finally {
      visiting.delete(block)
    }
  })
}

export function mapBlocks(
  blocks: unknown,
  pageSlug: string,
  prefix: string,
  mapper: (block: Block, path: string, props: Record<string, unknown>) => Record<string, unknown>,
  depth = 0,
  visiting = new WeakSet<object>()
): Block[] {
  if (depth > MAX_BLOCK_TREE_DEPTH) {
    return []
  }

  return asBlockList(blocks).map((block, index) => {
    if (visiting.has(block)) {
      return { id: block.id, type: block.type, props: asRecord(block.props) as unknown as Block['props'] }
    }

    visiting.add(block)

    try {
      const path = `${pageSlug}${prefix}/${index}`
      let props = mapper(block, path, asRecord(block.props))

      if (block.type === 'section') {
        props = {
          ...props,
          ...mapNestedSectionLists(
            props as unknown as SectionBlockProps,
            pageSlug,
            prefix,
            index,
            mapper,
            depth + 1,
            visiting
          )
        }
      } else if (block.type === 'carousel') {
        const carousel = props as unknown as CarouselBlockProps
        props = {
          ...carousel,
          slides: (carousel.slides ?? []).map((slide, slideIndex) => ({
            ...slide,
            children: mapBlocks(
              slide.children,
              pageSlug,
              `${prefix}/${index}/slide/${slideIndex}`,
              mapper,
              depth + 1,
              visiting
            )
          }))
        }
      } else if (block.type === 'tabs') {
        const tabs = props as unknown as TabsBlockProps
        props = {
          ...tabs,
          tabs: (tabs.tabs ?? []).map((panel, panelIndex) => ({
            ...panel,
            children: mapBlocks(panel.children, pageSlug, `${prefix}/${index}/tab/${panelIndex}`, mapper, depth + 1, visiting)
          }))
        }
      }

      return { id: block.id, type: block.type, props: props as unknown as Block['props'] }
    } finally {
      visiting.delete(block)
    }
  })
}

export function collectBlockMediaSlots(
  pageSlug: string,
  blocks: Block[],
  queryHint: string
): BlockMediaSlot[] {
  const slots: BlockMediaSlot[] = []

  walkBlocks(blocks, pageSlug, '/blocks', (block, path, props) => {
    if (block.type === 'image') {
      slots.push({
        path,
        kind: 'image',
        currentUrl: readString(props.src),
        queryHint
      })
    }

    // Brand logos stay as provided — never replace them with stock photography.

    if (readString(props.backgroundType) === 'photo' || readString(props.background).startsWith('http')) {
      slots.push({
        path: `${path}:background`,
        kind: 'background',
        currentUrl: readString(props.background),
        queryHint
      })
    }

    if (block.type === 'showcase') {
      const showcase = props as unknown as ShowcaseBlockProps
      showcase.items?.forEach((item, itemIndex) => {
        if (item.visualKind === 'logo') {
          return
        }

        slots.push({
          path: `${path}/item/${itemIndex}`,
          kind: 'showcase',
          currentUrl: item.imageSrc ?? '',
          queryHint
        })
      })
    }
  })

  return slots
}

export function applyBrandToBlocks(
  blocks: Block[],
  brand: { companyName: string; logoUrl?: string; pageSlugs: string[] }
): Block[] {
  const navLinks = [
    { label: 'Home', href: '/' },
    ...(brand.pageSlugs.includes('about') ? [{ label: 'About', href: 'about' }] : []),
    ...(brand.pageSlugs.includes('contact') ? [{ label: 'Contact', href: 'contact' }] : [])
  ]

  const year = new Date().getFullYear()

  const apply = (inner: unknown, depth = 0, visiting = new WeakSet<object>()): Block[] => {
    if (depth > MAX_BLOCK_TREE_DEPTH) {
      return []
    }

    return asBlockList(inner).map(block => {
      if (visiting.has(block)) {
        return { id: block.id, type: block.type, props: asRecord(block.props) as unknown as Block['props'] }
      }

      visiting.add(block)

      try {
        const props = { ...asRecord(block.props) }

        if (block.type === 'header' || block.type === 'footer') {
          props.logoText = brand.companyName
          if (brand.logoUrl) {
            props.logoUrl = brand.logoUrl
          }
          if (navLinks.length) {
            props.navLinks = navLinks.map(link => ({ ...link }))
          }
        }

        if (block.type === 'footer') {
          props.copyrightText = `© ${year} ${brand.companyName}. All rights reserved.`
        }

        if (block.type === 'section') {
          const section = props as unknown as SectionBlockProps
          const cache = new Map<unknown, Block[]>()
          const applyList = (value: unknown) => {
            if (cache.has(value)) {
              return cache.get(value) as Block[]
            }

            const mapped = apply(value, depth + 1, visiting)
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
                children: apply(slide.children, depth + 1, visiting)
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
                children: apply(panel.children, depth + 1, visiting)
              }))
            } as Block['props']
          }
        }

        return { id: block.id, type: block.type, props: props as unknown as Block['props'] }
      } finally {
        visiting.delete(block)
      }
    })
  }

  return apply(blocks)
}

export function applyMediaFills(
  pageSlug: string,
  blocks: Block[],
  fills: Map<string, MediaFill>,
  forcePhotoBackgrounds: boolean
): Block[] {
  return mapBlocks(blocks, pageSlug, '/blocks', (block, path, props) => {
    const next = { ...props }
    const imageFill = fills.get(path)
    const backgroundFill = fills.get(`${path}:background`)

    if ((block.type === 'image' || block.type === 'logo') && imageFill) {
      next.src = imageFill.url
      if (imageFill.alt) {
        next.alt = imageFill.alt
      }
      if (block.type === 'image') {
        next.hoverEffect = imageFill.hoverEffect
        next.entranceAnimation = imageFill.entranceAnimation
        next.continuousAnimation = imageFill.continuousAnimation
      }
    }

    if (block.type === 'header' || block.type === 'footer') {
      const logoFill = fills.get(`${path}:logoUrl`)
      if (logoFill) {
        next.logoUrl = logoFill.url
      }
    }

    if (backgroundFill) {
      next.backgroundType = 'photo'
      next.background = backgroundFill.url
      next.backgroundPhotoAnimation = backgroundFill.hoverEffect
    } else if (forcePhotoBackgrounds && (block.type === 'hero' || block.type === 'section') && fills.has(`${path}:forced-bg`)) {
      const forced = fills.get(`${path}:forced-bg`)
      if (forced) {
        next.backgroundType = 'photo'
        next.background = forced.url
        next.backgroundPhotoAnimation = forced.hoverEffect
      }
    }

    if (block.type === 'showcase') {
      const showcase = next as unknown as ShowcaseBlockProps
      next.items = (showcase.items ?? []).map((item, itemIndex) => {
        const fill = fills.get(`${path}/item/${itemIndex}`)
        if (!fill) {
          return item
        }

        return {
          ...item,
          visualKind: 'image' as const,
          imageSrc: fill.url,
          imageAlt: fill.alt || item.imageAlt
        }
      })
    }

    return next
  })
}

export function collectForceBackgroundPaths(pageSlug: string, blocks: Block[]): string[] {
  const paths: string[] = []
  let extraSections = 0

  walkBlocks(blocks, pageSlug, '/blocks', (block, path, props) => {
    if (readString(props.backgroundType) === 'photo') {
      return
    }

    const backgroundType = readString(props.backgroundType)
    const background = readString(props.background)
    const visualAnimation = readString(props.splitVisualAnimation)
    const keepsDesignedColor =
      backgroundType === 'color' ||
      backgroundType === 'gradient' ||
      backgroundType === 'pattern' ||
      (visualAnimation !== '' && visualAnimation !== 'static') ||
      isSimpleColor(background) ||
      background.includes('gradient')

    if (keepsDesignedColor) {
      return
    }

    if (block.type === 'hero') {
      paths.push(`${path}:forced-bg`)

      return
    }

    if (block.type === 'section' && extraSections < 1) {
      extraSections += 1
      paths.push(`${path}:forced-bg`)
    }
  })

  return paths
}

export function countFilledPhotos(slots: BlockMediaSlot[], fills: Map<string, MediaFill>): number {
  return slots.filter(slot => fills.has(slot.path) && fills.get(slot.path)?.url).length
}

export type { HeaderBlockProps }
