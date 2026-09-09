import type { Block } from '@/features/your-space/types'
import type {
  CarouselBlockProps,
  HeroBlockProps,
  ImageBlockProps,
  SectionBlockProps,
  ShowcaseBlockProps,
  PricingBlockProps,
  TabsBlockProps
} from '@/features/your-space/types'

function isHttpUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}

function photoBackgroundFromProps(props: {
  background?: string
  backgroundType?: string
}): string | null {
  if (props.backgroundType === 'photo' && isHttpUrl(props.background)) {
    return props.background
  }

  return null
}

function collectFromBlocks(blocks: Block[], urls: string[]) {
  for (const block of blocks) {
    if (block.type === 'hero') {
      const props = block.props as HeroBlockProps
      const photo = photoBackgroundFromProps(props)

      if (photo) {
        urls.push(photo)
      }
    }

    if (block.type === 'image') {
      const props = block.props as ImageBlockProps

      if (isHttpUrl(props.src)) {
        urls.push(props.src)
      }
    }

    if (block.type === 'showcase') {
      const props = block.props as ShowcaseBlockProps
      const photo = photoBackgroundFromProps(props)

      if (photo) {
        urls.push(photo)
      }

      for (const item of props.items ?? []) {
        if (isHttpUrl(item.imageSrc)) {
          urls.push(item.imageSrc)
        }

        if (isHttpUrl(item.logoSrc)) {
          urls.push(item.logoSrc)
        }
      }
    }

    if (block.type === 'pricing') {
      const props = block.props as PricingBlockProps
      const photo = photoBackgroundFromProps(props)

      if (photo) {
        urls.push(photo)
      }
    }

    if (block.type === 'section') {
      const props = block.props as SectionBlockProps
      const photo = photoBackgroundFromProps(props)

      if (photo) {
        urls.push(photo)
      }

      collectFromBlocks((props.children ?? []) as Block[], urls)
      collectFromBlocks((props.primaryChildren ?? []) as Block[], urls)
      collectFromBlocks((props.secondaryChildren ?? []) as Block[], urls)
      collectFromBlocks((props.tertiaryChildren ?? []) as Block[], urls)
      collectFromBlocks((props.quaternaryChildren ?? []) as Block[], urls)
    }

    if (block.type === 'carousel') {
      const props = block.props as CarouselBlockProps

      for (const slide of props.slides ?? []) {
        collectFromBlocks(slide.children ?? [], urls)
      }
    }

    if (block.type === 'tabs') {
      const props = block.props as TabsBlockProps

      for (const panel of props.tabs ?? []) {
        collectFromBlocks(panel.children ?? [], urls)
      }
    }
  }
}

/** Pick the best image URL from home page blocks (hero photo first). */
export function extractHomePagePreviewImageUrl(blocks: Block[]): string | null {
  const urls: string[] = []
  collectFromBlocks(blocks, urls)

  return urls[0] ?? null
}

export function findHeroBlock(blocks: Block[]): HeroBlockProps | null {
  for (const block of blocks) {
    if (block.type === 'hero') {
      return block.props as HeroBlockProps
    }

    if (block.type === 'section') {
      const props = block.props as SectionBlockProps
      const nested =
        findHeroBlock((props.children ?? []) as Block[]) ??
        findHeroBlock((props.primaryChildren ?? []) as Block[]) ??
        findHeroBlock((props.secondaryChildren ?? []) as Block[]) ??
        findHeroBlock((props.tertiaryChildren ?? []) as Block[]) ??
        findHeroBlock((props.quaternaryChildren ?? []) as Block[])

      if (nested) {
        return nested
      }
    }
  }

  return null
}
