'use client'

import type {
  Block,
  ButtonBlockProps,
  CarouselBlockProps,
  FooterBlockProps,
  HeaderBlockProps,
  HeadingBlockProps,
  HeroBlockProps,
  IconBlockProps,
  ContactFormBlockProps,
  ImageBlockProps,
  LogoBlockProps,
  ShapeBlockProps,
  TextBlockProps,
  VideoBlockProps
} from '../../types'
import { ContactFormBlock } from './ContactFormBlock'
import { ButtonBlock } from './ButtonBlock'
import { FooterBlock } from './FooterBlock'
import { HeaderBlock } from './HeaderBlock'
import { HeadingBlock } from './HeadingBlock'
import { HeroBlock } from './HeroBlock'
import { IconBlock } from './IconBlock'
import { ImageBlock } from './ImageBlock'
import { LogoBlock } from './LogoBlock'
import { ShapeBlock } from './ShapeBlock'
import { CarouselBlock, CarouselBlockPreview } from './CarouselBlock'
import { TabsBlock, TabsBlockPreview } from './TabsBlock'
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
    case 'carousel':
      return preview ? <CarouselBlockPreview block={block} /> : <CarouselBlock block={block} />
    case 'tabs':
      return preview ? <TabsBlockPreview block={block} /> : <TabsBlock block={block} />
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
    case 'shape':
      return <ShapeBlock props={block.props as ShapeBlockProps} />
    case 'icon':
      return <IconBlock props={block.props as IconBlockProps} />
    case 'contactForm':
      return <ContactFormBlock blockId={block.id} props={block.props as ContactFormBlockProps} />
    default:
      return null
  }
}

export function getBlockLabel(type: Block['type']) {
  const labels: Record<Block['type'], string> = {
    section: 'Section',
    carousel: 'Carousel',
    tabs: 'Tabs',
    header: 'Header',
    footer: 'Footer',
    hero: 'Hero',
    heading: 'Heading',
    text: 'Paragraph',
    button: 'Button',
    image: 'Image',
    video: 'Video',
    logo: 'Logo',
    shape: 'Shape',
    icon: 'Icon',
    contactForm: 'Contact Form'
  }

  return labels[type]
}
