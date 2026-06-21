'use client'

import type {
  Block,
  ButtonBlockProps,
  FooterBlockProps,
  HeaderBlockProps,
  HeadingBlockProps,
  HeroBlockProps,
  ImageBlockProps,
  LogoBlockProps,
  TextBlockProps,
  VideoBlockProps
} from '../../types'
import { ButtonBlock } from './ButtonBlock'
import { FooterBlock } from './FooterBlock'
import { HeaderBlock } from './HeaderBlock'
import { HeadingBlock } from './HeadingBlock'
import { HeroBlock } from './HeroBlock'
import { ImageBlock } from './ImageBlock'
import { LogoBlock } from './LogoBlock'
import { SectionBlock, SectionBlockPreview } from './SectionBlock'
import { TextBlock } from './TextBlock'
import { VideoBlock } from './VideoBlock'

type Props = {
  block: Block
  preview?: boolean
}

export function BlockRenderer({ block, preview = false }: Props) {
  switch (block.type) {
    case 'header':
      return <HeaderBlock props={block.props as HeaderBlockProps} />
    case 'footer':
      return <FooterBlock props={block.props as FooterBlockProps} />
    case 'hero':
      return <HeroBlock props={block.props as HeroBlockProps} />
    case 'section':
      return preview ? <SectionBlockPreview block={block} /> : <SectionBlock block={block} />
    case 'heading':
      return <HeadingBlock props={block.props as HeadingBlockProps} />
    case 'text':
      return <TextBlock props={block.props as TextBlockProps} />
    case 'button':
      return <ButtonBlock props={block.props as ButtonBlockProps} />
    case 'image':
      return <ImageBlock props={block.props as ImageBlockProps} />
    case 'video':
      return <VideoBlock props={block.props as VideoBlockProps} />
    case 'logo':
      return <LogoBlock props={block.props as LogoBlockProps} />
    default:
      return null
  }
}

export function getBlockLabel(type: Block['type']) {
  const labels: Record<Block['type'], string> = {
    section: 'Section',
    header: 'Header',
    footer: 'Footer',
    hero: 'Hero',
    heading: 'Heading',
    text: 'Paragraph',
    button: 'Button',
    image: 'Image',
    video: 'Video',
    logo: 'Logo'
  }

  return labels[type]
}
