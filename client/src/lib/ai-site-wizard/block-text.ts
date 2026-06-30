import type {
  Block,
  CarouselBlockProps,
  ContactFormBlockProps,
  FooterBlockProps,
  HeaderBlockProps,
  HeroBlockProps,
  SectionBlockProps,
  TabsBlockProps
} from '@/features/your-space/types'

export type BlockTextField = {
  path: string
  blockType: string
  field: string
  currentValue: string
}

function pushField(
  fields: BlockTextField[],
  path: string,
  blockType: string,
  field: string,
  value: unknown
) {
  if (typeof value !== 'string' || !value.trim()) {
    return
  }

  fields.push({
    path,
    blockType,
    field,
    currentValue: value
  })
}

function collectFromBlocks(blocks: Block[], pageSlug: string, prefix: string, fields: BlockTextField[]) {
  blocks.forEach((block, index) => {
    const path = `${pageSlug}${prefix}/${index}`

    if (block.type === 'hero') {
      const props = block.props as HeroBlockProps
      pushField(fields, path, 'hero', 'title', props.title)
      pushField(fields, path, 'hero', 'subtitle', props.subtitle)
      pushField(fields, path, 'hero', 'eyebrow', props.eyebrow)
      pushField(fields, path, 'hero', 'buttonText', props.buttonText)
      pushField(fields, path, 'hero', 'secondaryButtonText', props.secondaryButtonText)
    }

    if (block.type === 'heading') {
      pushField(fields, path, 'heading', 'text', (block.props as { text?: string }).text)
    }

    if (block.type === 'text') {
      pushField(fields, path, 'text', 'text', (block.props as { text?: string }).text)
    }

    if (block.type === 'button') {
      pushField(fields, path, 'button', 'text', (block.props as { text?: string }).text)
    }

    if (block.type === 'header') {
      const props = block.props as HeaderBlockProps
      pushField(fields, path, 'header', 'logoText', props.logoText)
      props.navLinks?.forEach((link, linkIndex) => {
        pushField(fields, `${path}/nav/${linkIndex}`, 'header', 'label', link.label)
      })
    }

    if (block.type === 'footer') {
      const props = block.props as FooterBlockProps
      pushField(fields, path, 'footer', 'copyrightText', props.copyrightText)
      props.navLinks?.forEach((link, linkIndex) => {
        pushField(fields, `${path}/nav/${linkIndex}`, 'footer', 'label', link.label)
      })
    }

    if (block.type === 'contactForm') {
      const props = block.props as ContactFormBlockProps
      pushField(fields, path, 'contactForm', 'title', props.title)
      pushField(fields, path, 'contactForm', 'subtitle', props.subtitle)
      pushField(fields, path, 'contactForm', 'submitLabel', props.submitLabel)
      pushField(fields, path, 'contactForm', 'successMessage', props.successMessage)
      pushField(fields, path, 'contactForm', 'signupLabel', props.signupLabel)
    }

    if (block.type === 'image' || block.type === 'logo') {
      pushField(fields, path, block.type, 'alt', (block.props as { alt?: string }).alt)
    }

    if (block.type === 'section') {
      const props = block.props as SectionBlockProps
      collectFromBlocks((props.children ?? []) as Block[], pageSlug, `${prefix}/${index}/children`, fields)
      collectFromBlocks((props.primaryChildren ?? []) as Block[], pageSlug, `${prefix}/${index}/primary`, fields)
      collectFromBlocks((props.secondaryChildren ?? []) as Block[], pageSlug, `${prefix}/${index}/secondary`, fields)
    }

    if (block.type === 'carousel') {
      const props = block.props as CarouselBlockProps
      props.slides?.forEach((slide, slideIndex) => {
        collectFromBlocks(slide.children ?? [], pageSlug, `${prefix}/${index}/slide/${slideIndex}`, fields)
      })
    }

    if (block.type === 'tabs') {
      const props = block.props as TabsBlockProps
      props.tabs?.forEach((panel, panelIndex) => {
        pushField(fields, `${path}/tab/${panelIndex}`, 'tabs', 'label', panel.label)
        collectFromBlocks(panel.children ?? [], pageSlug, `${prefix}/${index}/tab/${panelIndex}`, fields)
      })
    }
  })
}

export function collectBlockTextFields(pageSlug: string, blocks: Block[]): BlockTextField[] {
  const fields: BlockTextField[] = []
  collectFromBlocks(blocks, pageSlug, '/blocks', fields)

  return fields
}

function applyToBlocks(blocks: Block[], pageSlug: string, prefix: string, patches: Map<string, string>): Block[] {
  return blocks.map((block, index) => {
    const path = `${pageSlug}${prefix}/${index}`
    let props = { ...block.props } as Record<string, unknown>

    const scalarFields = ['title', 'subtitle', 'eyebrow', 'buttonText', 'secondaryButtonText', 'text', 'logoText', 'copyrightText', 'submitLabel', 'successMessage', 'signupLabel', 'alt']

    for (const field of scalarFields) {
      const patchKey = `${path}:${field}`
      const patchValue = patches.get(patchKey)

      if (patchValue !== undefined) {
        props[field] = patchValue
      }
    }

    if (block.type === 'header' || block.type === 'footer') {
      const navLinks = [...(((props.navLinks as Array<{ label: string; href: string }>) ?? []))]
      navLinks.forEach((link, linkIndex) => {
        const patchKey = `${path}/nav/${linkIndex}:label`
        const patchValue = patches.get(patchKey)

        if (patchValue !== undefined) {
          navLinks[linkIndex] = { ...link, label: patchValue }
        }
      })
      props.navLinks = navLinks
    }

    if (block.type === 'tabs') {
      const tabs = [...(((props.tabs as TabsBlockProps['tabs']) ?? []))]
      tabs.forEach((panel, panelIndex) => {
        const labelPatch = patches.get(`${path}/tab/${panelIndex}:label`)

        if (labelPatch !== undefined) {
          tabs[panelIndex] = { ...panel, label: labelPatch }
        }

        tabs[panelIndex] = {
          ...tabs[panelIndex],
          children: applyToBlocks(panel.children ?? [], pageSlug, `${prefix}/${index}/tab/${panelIndex}`, patches)
        }
      })
      props.tabs = tabs
    } else if (block.type === 'section') {
      const sectionProps = props as unknown as SectionBlockProps
      props = {
        ...sectionProps,
        children: applyToBlocks((sectionProps.children ?? []) as Block[], pageSlug, `${prefix}/${index}/children`, patches),
        primaryChildren: applyToBlocks((sectionProps.primaryChildren ?? []) as Block[], pageSlug, `${prefix}/${index}/primary`, patches),
        secondaryChildren: applyToBlocks((sectionProps.secondaryChildren ?? []) as Block[], pageSlug, `${prefix}/${index}/secondary`, patches)
      }
    } else if (block.type === 'carousel') {
      const carouselProps = props as unknown as CarouselBlockProps
      props = {
        ...carouselProps,
        slides: (carouselProps.slides ?? []).map((slide, slideIndex) => ({
          ...slide,
          children: applyToBlocks(slide.children ?? [], pageSlug, `${prefix}/${index}/slide/${slideIndex}`, patches)
        }))
      }
    }

    return { ...block, props: props as unknown as Block['props'] }
  })
}

export function applyBlockTextPatches(pageSlug: string, blocks: Block[], replacements: Array<{ path: string; field: string; value: string }>): Block[] {
  const patches = new Map<string, string>()

  for (const item of replacements) {
    patches.set(`${item.path}:${item.field}`, item.value)
  }

  return applyToBlocks(blocks, pageSlug, '/blocks', patches)
}
