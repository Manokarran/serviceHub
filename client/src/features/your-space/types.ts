export type BlockType =
  | 'section'
  | 'carousel'
  | 'tabs'
  | 'header'
  | 'footer'
  | 'hero'
  | 'heading'
  | 'text'
  | 'button'
  | 'image'
  | 'video'
  | 'logo'
  | 'shape'

export type LogoPosition = 'left' | 'center' | 'right'

export type TextAlign = 'left' | 'center' | 'right'

export type HeaderLayout = 'horizontal' | 'vertical'

export type HeroLayout = 'centered' | 'split-left' | 'split-right'

export interface SplitVisualConfig {
  splitVisualAnimation?: HeroSplitVisualAnimation
  splitVisualColorStart?: string
  splitVisualColorEnd?: string
}

/** Where animated backgrounds render on split section layouts. */
export type SectionVisualPlacement = 'background' | 'primary' | 'secondary'

export type HeroSplitVisualAnimation =
  | 'static'
  | 'floating-circles'
  | 'orbiting-dots'
  | 'pulse-rings'
  | 'gradient-shift'
  | 'morphing-blobs'
  | 'aurora'
  | 'mesh-gradient'
  | 'wave-lines'
  | 'dot-grid'
  | 'shimmer'
  | 'constellation'
  | 'geometric'
  | 'particles-rise'

export type SectionLayout = 'default' | 'split-horizontal' | 'split-vertical'

export type SectionBorderStyle = 'none' | 'subtle' | 'outline' | 'elevated' | 'inset'

export type SectionSplitStyle = 'flush' | 'gap' | 'divider' | 'contrast'

export type BackgroundType = 'color' | 'pattern' | 'gradient' | 'photo' | 'video'

export type ImageHoverEffect = 'none' | 'zoom' | 'fade'

export interface NavLinkItem {
  label: string
  href: string
}

export type BuilderMode = 'edit' | 'preview'

export type { SiteStyles, SiteStylesView } from './types/siteStyles'

export type BuilderViewport = 'desktop' | 'tablet' | 'mobile'

export type BuilderSidebarPanel = 'pages' | 'blocks' | 'design'

export type PaletteCategory = 'layout' | 'sections' | 'media' | 'typography'

export interface BlockBackgroundProps {
  background?: string
  /** @deprecated Use `background` — kept for persisted documents before migration */
  backgroundColor?: string
  backgroundType?: BackgroundType
  /** Solid background opacity (0–100). Lower values reveal page background animation. */
  backgroundOpacity?: number
  /** Photo background opacity (0–100). Only used when backgroundType is `photo`. */
  backgroundPhotoOpacity?: number
  /** Photo animation; falls back to site Image Blocks hover effect when unset. */
  backgroundPhotoAnimation?: ImageHoverEffect
}

export interface HeaderBlockProps {
  logoText: string
  logoUrl: string
  logoPosition: LogoPosition
  navLinks: NavLinkItem[]
  layout: HeaderLayout
  backgroundColor: string
  backgroundOpacity?: number
  textColor: string
  fixed: boolean
  borderRadius?: number
}

export interface FooterBlockProps {
  logoText: string
  logoUrl: string
  logoPosition: LogoPosition
  copyrightText: string
  navLinks: NavLinkItem[]
  layout: HeaderLayout
  backgroundColor: string
  backgroundOpacity?: number
  textColor: string
  fixed: boolean
  borderRadius?: number
}

export interface HeroBlockProps {
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  textColor: string
  alignment: TextAlign
  layout: HeroLayout
  minHeight: number
  splitVisualAnimation?: HeroSplitVisualAnimation
  splitVisualColorStart?: string
  splitVisualColorEnd?: string
  background: string
  backgroundType: BackgroundType
  backgroundOpacity?: number
  backgroundPhotoOpacity?: number
  backgroundPhotoAnimation?: ImageHoverEffect
  /** @deprecated Use `background` — kept for persisted documents before migration */
  backgroundColor?: string
}

export type CarouselTransition = 'slide' | 'fade' | 'scale' | 'coverflow'

export type CarouselArrowStyle = 'minimal' | 'rounded' | 'floating'

export type CarouselDotStyle = 'dots' | 'lines' | 'fraction'

export interface CarouselSlide {
  id: string
  children: Block[]
}

export type TabOrientation = 'horizontal' | 'vertical'

export type TabVariant = 'underline' | 'pills' | 'segmented' | 'bordered' | 'elevated'

export type TabContentAnimation = 'none' | 'fade' | 'slide-up' | 'slide-horizontal' | 'scale'

export type TabBorderStyle = SectionBorderStyle

export interface TabPanel {
  id: string
  label: string
  /** Optional Remix Icon class name (e.g. 'ri-user-line') shown next to the tab label */
  icon?: string
  children: Block[]
}

export interface TabsBlockProps {
  tabs: TabPanel[]
  orientation: TabOrientation
  variant: TabVariant
  activeTabColor: string
  inactiveTabColor: string
  indicatorColor: string
  tabBackgroundColor: string
  contentBackgroundColor: string
  contentBorderRadius: number
  tabGap: number
  paddingY: number
  paddingX: number
  maxWidth: 'sm' | 'md' | 'lg' | 'full'
  contentMinHeight: number
  fullWidthTabs: boolean
  contentAnimation: TabContentAnimation
  animationDuration: number
  tabBarBorderStyle: TabBorderStyle
  tabBarBorderWidth: number
  tabBarBorderColor: string
  tabBarBorderRadius: number
  contentBorderStyle: TabBorderStyle
  contentBorderWidth: number
  contentBorderColor: string
  tabBorderRadius: number
}

export interface CarouselBlockProps {
  slides: CarouselSlide[]
  transition: CarouselTransition
  autoplay: boolean
  autoplayInterval: number
  loop: boolean
  showArrows: boolean
  showDots: boolean
  arrowStyle: CarouselArrowStyle
  dotStyle: CarouselDotStyle
  slidesPerView: number
  slideGap: number
  slidePeek: number
  transitionDuration: number
  paddingY: number
  paddingX: number
  maxWidth: 'sm' | 'md' | 'lg' | 'full'
  borderRadius: number
  slideMinHeight: number
  arrowColor: string
  dotColor: string
}

export interface SectionBlockProps extends BlockBackgroundProps, SplitVisualConfig {
  background: string
  backgroundType: BackgroundType
  paddingY: number
  paddingX: number
  maxWidth: 'sm' | 'md' | 'lg' | 'full'
  layout: SectionLayout
  splitRatio: number
  /** Animated background target for double/stacked layouts. Single layout always uses full section. */
  splitVisualPlacement?: SectionVisualPlacement
  primarySplitVisualAnimation?: HeroSplitVisualAnimation
  primarySplitVisualColorStart?: string
  primarySplitVisualColorEnd?: string
  secondarySplitVisualAnimation?: HeroSplitVisualAnimation
  secondarySplitVisualColorStart?: string
  secondarySplitVisualColorEnd?: string
  borderStyle: SectionBorderStyle
  borderWidth: number
  borderColor: string
  borderRadius: number
  splitStyle: SectionSplitStyle
  splitGap: number
  splitDividerColor: string
  primaryColumnBackground: string
  secondaryColumnBackground: string
  children: Block[]
  primaryChildren: Block[]
  secondaryChildren: Block[]
}

export interface HeadingBlockProps {
  text: string
  level: 1 | 2 | 3
  alignment: TextAlign
  color: string
}

export interface TextBlockProps {
  text: string
  alignment: TextAlign
  color: string
}

export interface ButtonBlockProps {
  text: string
  link: string
  variant: 'contained' | 'outlined' | 'text'
  alignment: TextAlign
  color: string
  borderRadius?: number
}

export interface ImageBlockProps {
  src: string
  alt: string
  alignment: TextAlign
  hoverEffect?: ImageHoverEffect
  borderRadius?: number
  /** Image opacity (0–100). Lower values make the image more transparent. */
  opacity?: number
}

export interface VideoBlockProps {
  src: string
  alignment: TextAlign
  autoplay: boolean
  muted: boolean
  loop: boolean
  controls: boolean
  borderRadius?: number
}

export interface LogoBlockProps {
  src: string
  alt: string
  link: string
  alignment: TextAlign
  maxHeight: number
}

export type ShapeVariant = 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'diamond' | 'star' | 'line'

export type ShapeFillType = 'solid' | 'gradient'

export type ShapeGradientStyle = 'linear' | 'radial'

export type ShapeLineStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'fade'
  | 'ornament'
  | 'feather'
  | 'brush'
  | 'sword'
  | 'wave'
  | 'flourish'

export interface ShapeBlockProps {
  variant: ShapeVariant
  alignment: TextAlign
  width: number
  height: number
  fillType: ShapeFillType
  fillColor: string
  gradientStart: string
  gradientEnd: string
  gradientAngle: number
  gradientStyle: ShapeGradientStyle
  strokeWidth: number
  strokeColor: string
  opacity: number
  rotation: number
  borderRadius: number
  lineStyle?: ShapeLineStyle
}

export type BlockPropsMap = {
  section: SectionBlockProps
  carousel: CarouselBlockProps
  tabs: TabsBlockProps
  header: HeaderBlockProps
  footer: FooterBlockProps
  hero: HeroBlockProps
  heading: HeadingBlockProps
  text: TextBlockProps
  button: ButtonBlockProps
  image: ImageBlockProps
  video: VideoBlockProps
  logo: LogoBlockProps
  shape: ShapeBlockProps
}

export interface Block<T extends BlockType = BlockType> {
  id: string
  type: T
  props: BlockPropsMap[T]
}

export interface PaletteItem {
  id: string
  type: BlockType
  label: string
  description: string
  icon: string
  category: PaletteCategory
  defaultProps: BlockPropsMap[BlockType]
}

export type DragSource = 'palette' | 'canvas'

export interface ActiveDragItem {
  source: DragSource
  type: BlockType
  paletteId?: string
  blockId?: string
  sectionId?: string
  column?: 'default' | 'primary' | 'secondary'
  carouselId?: string
  slideId?: string
  tabsId?: string
  panelId?: string
}
