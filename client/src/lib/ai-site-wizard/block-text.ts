import type {
  Block,
  CarouselBlockProps,
  ContactFormBlockProps,
  FooterBlockProps,
  HeaderBlockProps,
  HeroBlockProps,
  PricingBlockProps,
  SectionBlockProps,
  ShowcaseBlockProps,
  TabsBlockProps
} from '@/features/your-space/types'
import { asBlockList, MAX_BLOCK_TREE_DEPTH } from '@/features/your-space/utils/blockList'

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

function collectFromBlocks(
  blocks: unknown,
  pageSlug: string,
  prefix: string,
  fields: BlockTextField[],
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
        if (!link || typeof link !== 'object') {
          return
        }

        pushField(fields, `${path}/nav/${linkIndex}`, 'header', 'label', link.label)
      })
    }

    if (block.type === 'footer') {
      const props = block.props as FooterBlockProps
      pushField(fields, path, 'footer', 'copyrightText', props.copyrightText)
      props.navLinks?.forEach((link, linkIndex) => {
        if (!link || typeof link !== 'object') {
          return
        }

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

    if (block.type === 'showcase') {
      const props = block.props as ShowcaseBlockProps
      props.items?.forEach((item, itemIndex) => {
        if (!item || typeof item !== 'object') {
          return
        }

        const itemPath = `${path}/item/${itemIndex}`
        pushField(fields, itemPath, 'showcase', 'logoText', item.logoText)
        pushField(fields, itemPath, 'showcase', 'eyebrow', item.eyebrow)
        pushField(fields, itemPath, 'showcase', 'title', item.title)
        pushField(fields, itemPath, 'showcase', 'body', item.body)
        pushField(fields, itemPath, 'showcase', 'buttonText', item.buttonText)
      })
    }

    if (block.type === 'pricing') {
      const props = block.props as PricingBlockProps
      pushField(fields, path, 'pricing', 'eyebrow', props.eyebrow)
      pushField(fields, path, 'pricing', 'title', props.title)
      pushField(fields, path, 'pricing', 'subtitle', props.subtitle)
      pushField(fields, path, 'pricing', 'monthlyLabel', props.monthlyLabel)
      pushField(fields, path, 'pricing', 'annualLabel', props.annualLabel)
      pushField(fields, path, 'pricing', 'annualBadge', props.annualBadge)
      props.plans?.forEach((plan, planIndex) => {
        const planPath = `${path}/plan/${planIndex}`
        pushField(fields, planPath, 'pricing', 'name', plan.name)
        pushField(fields, planPath, 'pricing', 'description', plan.description)
        pushField(fields, planPath, 'pricing', 'badge', plan.badge)
        pushField(fields, planPath, 'pricing', 'ctaText', plan.ctaText)
        plan.features?.forEach((feature, featureIndex) => {
          pushField(fields, `${planPath}/feature/${featureIndex}`, 'pricing', 'text', feature.text)
        })
      })
    }

    if (block.type === 'image' || block.type === 'logo') {
      pushField(fields, path, block.type, 'alt', (block.props as { alt?: string }).alt)
    }

    if (block.type === 'section') {
      const props = block.props as SectionBlockProps
      const lists: Array<[unknown, string]> = [
        [props.children, `${prefix}/${index}/children`],
        [props.primaryChildren, `${prefix}/${index}/primary`],
        [props.secondaryChildren, `${prefix}/${index}/secondary`]
      ]
      const seen = new Set<unknown>()

      for (const [list, nextPrefix] of lists) {
        if (seen.has(list)) {
          continue
        }

        seen.add(list)
        collectFromBlocks(list, pageSlug, nextPrefix, fields, depth + 1, visiting)
      }
    }

    if (block.type === 'carousel') {
      const props = block.props as CarouselBlockProps
      props.slides?.forEach((slide, slideIndex) => {
        if (!slide || typeof slide !== 'object') {
          return
        }

        collectFromBlocks(slide.children, pageSlug, `${prefix}/${index}/slide/${slideIndex}`, fields, depth + 1, visiting)
      })
    }

    if (block.type === 'tabs') {
      const props = block.props as TabsBlockProps
      props.tabs?.forEach((panel, panelIndex) => {
        if (!panel || typeof panel !== 'object') {
          return
        }

        pushField(fields, `${path}/tab/${panelIndex}`, 'tabs', 'label', panel.label)
        collectFromBlocks(panel.children, pageSlug, `${prefix}/${index}/tab/${panelIndex}`, fields, depth + 1, visiting)
      })
    }
    } finally {
      visiting.delete(block)
    }
  })
}

export function collectBlockTextFields(pageSlug: string, blocks: Block[]): BlockTextField[] {
  const fields: BlockTextField[] = []
  collectFromBlocks(blocks, pageSlug, '/blocks', fields)

  return fields
}

function applyToBlocks(
  blocks: unknown,
  pageSlug: string,
  prefix: string,
  patches: Map<string, string>,
  depth = 0,
  visiting = new WeakSet<object>()
): Block[] {
  if (depth > MAX_BLOCK_TREE_DEPTH) {
    return []
  }

  return asBlockList(blocks).map((block, index) => {
    if (visiting.has(block)) {
      return { id: block.id, type: block.type, props: block.props }
    }

    visiting.add(block)

    try {
    const path = `${pageSlug}${prefix}/${index}`
    let props = { ...(block.props as unknown as Record<string, unknown>) }

    const scalarFields = ['title', 'subtitle', 'eyebrow', 'buttonText', 'secondaryButtonText', 'text', 'logoText', 'copyrightText', 'submitLabel', 'successMessage', 'signupLabel', 'alt']

    for (const field of scalarFields) {
      const patchKey = `${path}:${field}`
      const patchValue = patches.get(patchKey)

      if (patchValue !== undefined) {
        props[field] = patchValue
      }
    }

    if (block.type === 'header' || block.type === 'footer') {
      const navLinks = Array.isArray(props.navLinks) ? props.navLinks : []
      props.navLinks = navLinks.map((link, linkIndex) => {
        if (!link || typeof link !== 'object') {
          return link
        }

        const patchKey = `${path}/nav/${linkIndex}:label`
        const patchValue = patches.get(patchKey)

        return patchValue !== undefined ? { ...link, label: patchValue } : link
      }).filter(link => Boolean(link && typeof link === 'object'))
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
          children: applyToBlocks(panel.children, pageSlug, `${prefix}/${index}/tab/${panelIndex}`, patches, depth + 1, visiting)
        }
      })
      props.tabs = tabs
    } else if (block.type === 'section') {
      const sectionProps = props as unknown as SectionBlockProps
      const cache = new Map<unknown, Block[]>()
      const applyList = (value: unknown, nextPrefix: string) => {
        if (cache.has(value)) {
          return cache.get(value) as Block[]
        }

        const mapped = applyToBlocks(value, pageSlug, nextPrefix, patches, depth + 1, visiting)
        cache.set(value, mapped)

        return mapped
      }

      props = {
        ...sectionProps,
        children: applyList(sectionProps.children, `${prefix}/${index}/children`),
        primaryChildren: applyList(sectionProps.primaryChildren, `${prefix}/${index}/primary`),
        secondaryChildren: applyList(sectionProps.secondaryChildren, `${prefix}/${index}/secondary`)
      }
    } else if (block.type === 'carousel') {
      const carouselProps = props as unknown as CarouselBlockProps
      props = {
        ...carouselProps,
        slides: (carouselProps.slides ?? []).map((slide, slideIndex) => ({
          ...slide,
          children: applyToBlocks(slide.children, pageSlug, `${prefix}/${index}/slide/${slideIndex}`, patches, depth + 1, visiting)
        }))
      }
    } else if (block.type === 'showcase') {
      const items = [...(((props.items as ShowcaseBlockProps['items']) ?? []))]
      const itemFields = ['logoText', 'eyebrow', 'title', 'body', 'buttonText'] as const

      items.forEach((item, itemIndex) => {
        const nextItem = { ...item }

        for (const field of itemFields) {
          const patchValue = patches.get(`${path}/item/${itemIndex}:${field}`)

          if (patchValue !== undefined) {
            nextItem[field] = patchValue
          }
        }

        items[itemIndex] = nextItem
      })
      props.items = items
    } else if (block.type === 'pricing') {
      const pricingProps = props as unknown as PricingBlockProps
      const plans = [...(pricingProps.plans ?? [])]
      const planFields = ['name', 'description', 'badge', 'ctaText'] as const

      plans.forEach((plan, planIndex) => {
        const nextPlan = { ...plan }

        for (const field of planFields) {
          const patchValue = patches.get(`${path}/plan/${planIndex}:${field}`)

          if (patchValue !== undefined) {
            nextPlan[field] = patchValue
          }
        }

        nextPlan.features = (plan.features ?? []).map((feature, featureIndex) => {
          const text = patches.get(`${path}/plan/${planIndex}/feature/${featureIndex}:text`)

          return text !== undefined ? { ...feature, text } : feature
        })

        plans[planIndex] = nextPlan
      })

      const nextProps = { ...pricingProps, plans }
      const eyebrow = patches.get(`${path}:eyebrow`)
      const title = patches.get(`${path}:title`)
      const subtitle = patches.get(`${path}:subtitle`)

      if (eyebrow !== undefined) nextProps.eyebrow = eyebrow
      if (title !== undefined) nextProps.title = title
      if (subtitle !== undefined) nextProps.subtitle = subtitle

      props = nextProps
    }

    return { id: block.id, type: block.type, props: props as unknown as Block['props'] }
    } finally {
      visiting.delete(block)
    }
  })
}

export function applyBlockTextPatches(pageSlug: string, blocks: Block[], replacements: Array<{ path: string; field: string; value: string }>): Block[] {
  const patches = new Map<string, string>()

  for (const item of replacements) {
    patches.set(`${item.path}:${item.field}`, item.value)
  }

  return applyToBlocks(blocks, pageSlug, '/blocks', patches)
}
