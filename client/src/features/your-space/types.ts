import type { LocationMapStyle } from '@/lib/location/types'

export const BLOCK_TYPES = [
  'section',
  'carousel',
  'tabs',
  'header',
  'footer',
  'hero',
  'heading',
  'text',
  'button',
  'image',
  'video',
  'logo',
  'shape',
  'icon',
  'contactForm',
  'showcase',
  'pricing',
  'faq',
  'serviceDirectory',
  'serviceBooking',
  'customerBookings',
  'location'
] as const

export type BlockType = (typeof BLOCK_TYPES)[number]

export type LogoPosition = 'left' | 'center' | 'right'

export type TextAlign = 'left' | 'center' | 'right'

export type HeaderLayout = 'horizontal' | 'vertical'

export type HeroLayout = 'centered' | 'split-left' | 'split-right'

export type HeroContentMaxWidth = 'sm' | 'md' | 'lg' | 'full'

export type HeroVerticalAlign = 'center' | 'bottom'

export type HeroMediaOverlay = 'none' | 'subtle' | 'strong' | 'gradient'

export type HeroContentSurface = 'none' | 'glass'

export type HeroTitleStyle = 'solid' | 'gradient'

export type HeroButtonStyle = 'theme' | 'contrast'

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
  | 'liquid-metal'
  | 'neon-pulse'
  | 'prism-beams'
  | 'ripple-field'
  | 'spotlight-sweep'
  | 'ribbon-flow'
  | 'plasma'
  | 'sparkle-rain'

export type SectionLayout =
  | 'default'
  | 'split-horizontal'
  | 'split-vertical'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'split-1-2'
  | 'split-2-1'
  | 'columns-3'
  | 'columns-4'

export type SectionBorderStyle = 'none' | 'subtle' | 'outline' | 'elevated' | 'inset'

export type SectionSplitStyle = 'flush' | 'gap' | 'divider' | 'contrast'

export type BackgroundType = 'color' | 'pattern' | 'gradient' | 'photo' | 'video'

export type ImageHoverEffect = 'none' | 'zoom' | 'fade' | 'lift' | 'blur' | 'grayscale'

/** Fractional crop region relative to the original image (0–1). */
export type ImageCropSettings = {
  x: number
  y: number
  width: number
  height: number
}

/** Non-destructive image adjustments (100 = neutral). */
export type ImageAdjustments = {
  brightness: number
  contrast: number
  saturation: number
  sharpness: number
}

export const DEFAULT_IMAGE_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sharpness: 0
}

export const DEFAULT_IMAGE_CROP: ImageCropSettings = {
  x: 0,
  y: 0,
  width: 1,
  height: 1
}

/** Animation that plays once when the image scrolls into view. */
export type ImageEntranceAnimation = 'none' | 'fade-in' | 'slide-up' | 'zoom-in' | 'blur-in' | 'flip-up'

/** Animation that loops continuously while the image is visible. */
export type ImageContinuousAnimation = 'none' | 'float' | 'pulse' | 'breathe' | 'shimmer' | 'swing'

/**
 * How the image is delivered from the CDN.
 * - optimized: smaller files, balanced quality (default)
 * - high: near-lossless delivery (q-100)
 * - original: serve the stored file as-is (no CDN recompression)
 */
export type ImageDeliveryQuality = 'optimized' | 'high' | 'original'

export interface NavLinkItem {
  label: string
  href: string
  children?: NavLinkItem[]
}

export type BuilderMode = 'edit' | 'preview'

export type { SiteStyles, SiteStylesView } from './types/siteStyles'

export type BuilderViewport = 'desktop' | 'tablet' | 'mobile'

export type BuilderSidebarPanel = 'pages' | 'blocks' | 'design'

export type PaletteCategory =
  | 'layout'
  | 'carousel'
  | 'tabs'
  | 'sections'
  | 'media'
  | 'typography'
  | 'forms'
  | 'pricing'
  | 'faq'
  | 'services'

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

export interface HeaderBlockProps extends BlockBackgroundProps, SplitVisualConfig {
  logoText: string
  logoUrl: string
  /** MUI icon name when no logo image is set (IconPicker). */
  logoIcon?: string
  logoIconColor?: string
  logoIconSize?: number
  logoIconShowBackground?: boolean
  logoIconBackgroundColor?: string
  logoIconBorderRadius?: number
  logoPosition: LogoPosition
  navLinks: NavLinkItem[]
  layout: HeaderLayout
  /** Solid fallback when `background` is unset */
  backgroundColor: string
  textColor: string
  fixed: boolean
  borderRadius?: number
  logoTypography?: TextTypographyOverrides
  navTypography?: TextTypographyOverrides
}

export interface FooterBlockProps extends BlockBackgroundProps, SplitVisualConfig {
  logoText: string
  logoUrl: string
  /** MUI icon name when no logo image is set (IconPicker). */
  logoIcon?: string
  logoIconColor?: string
  logoIconSize?: number
  logoIconShowBackground?: boolean
  logoIconBackgroundColor?: string
  logoIconBorderRadius?: number
  logoPosition: LogoPosition
  copyrightText: string
  navLinks: NavLinkItem[]
  layout: HeaderLayout
  /** Solid fallback when `background` is unset */
  backgroundColor: string
  textColor: string
  fixed: boolean
  borderRadius?: number
  logoTypography?: TextTypographyOverrides
  navTypography?: TextTypographyOverrides
  copyrightTypography?: TextTypographyOverrides
}

export interface HeroBlockProps {
  title: string
  subtitle: string
  eyebrow?: string
  buttonText: string
  buttonLink: string
  secondaryButtonText?: string
  secondaryButtonLink?: string
  /** `theme` uses site-wide button styles; `contrast` adapts to hero text color. */
  buttonStyle?: HeroButtonStyle
  textColor: string
  alignment: TextAlign
  layout: HeroLayout
  verticalAlign?: HeroVerticalAlign
  minHeight: number
  contentMaxWidth?: HeroContentMaxWidth
  contentPaddingX?: number
  contentPaddingY?: number
  splitRatio?: number
  titleStyle?: HeroTitleStyle
  contentSurface?: HeroContentSurface
  mediaOverlay?: HeroMediaOverlay
  splitVisualAnimation?: HeroSplitVisualAnimation
  splitVisualColorStart?: string
  splitVisualColorEnd?: string
  /**
   * When enabled, the `{rotate}` token in `title` cycles through `rotatingWords`
   * with a slide-up animation (same idea as the register hero).
   */
  rotatingWordsEnabled?: boolean
  rotatingWords?: string[]
  /** Milliseconds between word changes. Defaults to 2400. */
  rotatingWordIntervalMs?: number
  background: string
  backgroundType: BackgroundType
  backgroundOpacity?: number
  backgroundPhotoOpacity?: number
  backgroundPhotoAnimation?: ImageHoverEffect
  /** @deprecated Use `background` — kept for persisted documents before migration */
  backgroundColor?: string
}

export type ShowcaseLayout = 'split' | 'stack' | 'cards'
export type ShowcaseColumns = 1 | 2 | 3
export type ShowcaseMediaSide = 'start' | 'end'
export type ShowcaseCardStyle = 'layered' | 'stacked'
export type ShowcaseVisualKind = 'image' | 'logo' | 'animation'

export interface ShowcaseItem {
  id: string
  logoSrc: string
  logoAlt: string
  logoText: string
  imageSrc: string
  imageAlt: string
  visualKind: ShowcaseVisualKind
  /** Photo hover effect when visualKind is image */
  imageHoverEffect?: ImageHoverEffect
  splitVisualAnimation: HeroSplitVisualAnimation
  splitVisualColorStart: string
  splitVisualColorEnd: string
  eyebrow: string
  title: string
  body: string
  buttonText: string
  buttonLink: string
}

export interface ShowcaseBlockProps extends BlockBackgroundProps, SplitVisualConfig {
  layout: ShowcaseLayout
  columns: ShowcaseColumns
  mediaSide: ShowcaseMediaSide
  cardStyle: ShowcaseCardStyle
  alignment: TextAlign
  textColor: string
  minHeight: number
  paddingY: number
  paddingX: number
  maxWidth: 'sm' | 'md' | 'lg' | 'full'
  splitRatio: number
  gap: number
  mediaRadius: number
  mediaOverlay: HeroMediaOverlay
  buttonStyle?: HeroButtonStyle
  titleStyle?: HeroTitleStyle
  items: ShowcaseItem[]
}

export type PricingLayout = 'cards' | 'comparison' | 'stack'
export type PricingCardStyle = 'elevated' | 'outlined' | 'filled' | 'tinted' | 'glass'
export type PricingCardShadow = 'none' | 'soft' | 'medium' | 'strong'
export type PricingInterval = 'monthly' | 'annual'
export type PricingFeatureState = 'included' | 'excluded' | 'limited'
export type PricingHoverEffect = 'none' | 'lift' | 'glow'
export type PricingEntranceAnimation = 'none' | 'fade-in' | 'slide-up'
export type PricingFeatureIconStyle = 'check' | 'dot' | 'none'
export type PricingColumns = 2 | 3 | 4

export interface PricingFeature {
  id: string
  text: string
  state: PricingFeatureState
  hint?: string
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  badge: string
  recommended: boolean
  monthlyPrice: number
  annualMonthlyPrice: number
  customPriceLabel: string
  currency: string
  discountPercent: number
  discountLabel: string
  features: PricingFeature[]
  ctaText: string
  ctaLink: string
  accentColor: string
  cardBackground: string
}

export interface PricingBlockProps extends BlockBackgroundProps, SplitVisualConfig {
  eyebrow: string
  title: string
  subtitle: string
  alignment: TextAlign
  layout: PricingLayout
  cardStyle: PricingCardStyle
  columns: PricingColumns
  showIntervalToggle: boolean
  defaultInterval: PricingInterval
  monthlyLabel: string
  annualLabel: string
  annualBadge: string
  currency: string
  showYearlyTotal: boolean
  plans: PricingPlan[]
  paddingY: number
  paddingX: number
  maxWidth: 'sm' | 'md' | 'lg' | 'full'
  gap: number
  cardRadius: number
  textColor: string
  accentColor: string
  cardBackground: string
  cardBorderColor: string
  cardBorderWidth: number
  cardShadow: PricingCardShadow
  recommendedScale: boolean
  buttonStyle?: HeroButtonStyle
  titleStyle?: HeroTitleStyle
  hoverEffect: PricingHoverEffect
  entranceAnimation: PricingEntranceAnimation
  recommendedGlow: boolean
  featureIconStyle: PricingFeatureIconStyle
}

export type FaqLayout = 'stack' | 'split-header'
export type FaqCardStyle = 'elevated' | 'outlined' | 'filled' | 'glass'
export type FaqExpandMode = 'single' | 'multiple'
export type FaqIconStyle = 'chevron' | 'plus' | 'caret'

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface FaqBlockProps extends BlockBackgroundProps, SplitVisualConfig {
  eyebrow: string
  title: string
  subtitle: string
  alignment: TextAlign
  layout: FaqLayout
  cardStyle: FaqCardStyle
  expandMode: FaqExpandMode
  defaultOpenFirst: boolean
  iconStyle: FaqIconStyle
  items: FaqItem[]
  paddingY: number
  paddingX: number
  maxWidth: 'sm' | 'md' | 'lg' | 'full'
  gap: number
  cardRadius: number
  textColor: string
  accentColor: string
  cardBackground: string
  cardBorderColor: string
  cardBorderWidth: number
  cardShadow: PricingCardShadow
  titleStyle?: HeroTitleStyle
  entranceAnimation: PricingEntranceAnimation
}

export type CarouselTransition = 'slide' | 'fade' | 'scale' | 'coverflow'

export type CarouselArrowStyle = 'minimal' | 'rounded' | 'floating'

export type CarouselDotStyle = 'dots' | 'lines' | 'fraction'

/** High-level carousel look — matches the four palette presets. */
export type CarouselStylePreset = 'slide' | 'fade' | 'cards' | 'coverflow'

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
  /** Optional icon name (MUI IconPicker) or legacy Remix class (ri-*). */
  icon?: string
  iconColor?: string
  iconSize?: number
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
  tabTypography?: TextTypographyOverrides
}

export interface CarouselBlockProps extends BlockBackgroundProps, SplitVisualConfig {
  slides: CarouselSlide[]
  /** Palette-aligned style preset (slide / fade / cards / coverflow). */
  stylePreset?: CarouselStylePreset
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
  /** Fill color for each slide panel/card. Empty uses the site surface. */
  slidePanelColor?: string
  /** Slide panel fill opacity 0–100. Lower values let the carousel background show through. */
  slidePanelOpacity?: number
  /** Show a subtle border around each slide panel. */
  showSlidePanelBorder?: boolean
  controlTypography?: TextTypographyOverrides
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
  tertiaryChildren: Block[]
  quaternaryChildren: Block[]
}

export type TextTypographyFontSource = 'heading' | 'body' | 'custom'

export type TextTypographyTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'

export type TextTypographyDecoration = 'none' | 'underline' | 'line-through'

export interface TextTypographyOverrides {
  fontSource?: TextTypographyFontSource
  fontFamily?: string
  fontSize?: number
  fontWeight?: number
  fontStyle?: 'normal' | 'italic'
  lineHeight?: number
  letterSpacing?: number
  textTransform?: TextTypographyTransform
  textDecoration?: TextTypographyDecoration
}

export interface HeadingBlockProps {
  text: string
  level: 1 | 2 | 3
  alignment: TextAlign
  color: string
  typography?: TextTypographyOverrides
  /** Visual treatment — display, eyebrow, or script headline. */
  variant?: HeadingBlockVariant
}

export type HeadingBlockVariant = 'default' | 'display' | 'eyebrow' | 'script'

export type TextBlockVariant =
  | 'paragraph'
  | 'lead'
  | 'quote'
  | 'pullquote'
  | 'testimonial'
  | 'calligraphy'
  | 'caption'
  | 'callout'

export interface TextBlockProps {
  text: string
  alignment: TextAlign
  color: string
  typography?: TextTypographyOverrides
  /** Visual treatment — paragraph, quote, review, calligraphy, etc. */
  variant?: TextBlockVariant
  /** Attribution name for quote / testimonial styles. */
  cite?: string
  /** Role or company under the attribution. */
  citeRole?: string
  /** Accent used for quote bars / callout borders. */
  accentColor?: string
}

export interface ButtonBlockProps {
  text: string
  link: string
  action?: 'link' | 'serviceDirectory' | 'serviceBooking'
  serviceSlug?: string
  variant: 'contained' | 'outlined' | 'text'
  alignment: TextAlign
  color: string
  borderRadius?: number
}

export type ServiceDirectoryLayout = 'cards' | 'list' | 'featured'

export interface ServiceDirectoryBlockProps extends BlockBackgroundProps, SplitVisualConfig {
  title: string
  subtitle: string
  serviceIds: string[]
  category: string
  layout: ServiceDirectoryLayout
  showSearch: boolean
  showCategory: boolean
  showPrice: boolean
  showDuration: boolean
  showAvailability: boolean
  ctaLabel: string
  alignment: TextAlign
}

export type ServiceBookingLayout = 'inline' | 'compact'

export interface ServiceBookingBlockProps extends BlockBackgroundProps, SplitVisualConfig {
  serviceSlug: string
  title: string
  subtitle: string
  layout: ServiceBookingLayout
  showServiceSummary: boolean
  showTimezone: boolean
  ctaLabel: string
  alignment: TextAlign
}

export interface CustomerBookingsBlockProps extends BlockBackgroundProps, SplitVisualConfig {
  title: string
  subtitle: string
  alignment: TextAlign
}

export type LocationBlockSource = 'profile' | 'custom'

export interface LocationBlockProps extends BlockBackgroundProps, SplitVisualConfig {
  title: string
  subtitle: string
  address: string
  latitude: number
  longitude: number
  source: LocationBlockSource
  showMap: boolean
  mapZoom: number
  mapStyle?: LocationMapStyle
  showMapControls?: boolean
  /** Map tile opacity (0–100). Lower values blend the map into the page background. */
  mapOpacity?: number
  alignment: TextAlign
}

export interface ImageBlockProps {
  src: string
  alt: string
  alignment: TextAlign
  /** Stored intrinsic width — keeps canvas/published size close to the uploaded original. */
  naturalWidth?: number
  /** Stored intrinsic height — paired with naturalWidth for delivery sizing. */
  naturalHeight?: number
  hoverEffect?: ImageHoverEffect
  borderRadius?: number
  /** Image opacity (0–100). Lower values make the image more transparent. */
  opacity?: number
  /** One-shot animation that plays when the image enters the viewport. */
  entranceAnimation?: ImageEntranceAnimation
  /** Looping animation applied continuously to the image. */
  continuousAnimation?: ImageContinuousAnimation
  /** Optional crop region (fractions of source). */
  crop?: ImageCropSettings | null
  /** Brightness, contrast, saturation, and sharpness tweaks. */
  adjustments?: ImageAdjustments | null
  /** CDN delivery quality — use `original` for the stored file without recompression. */
  deliveryQuality?: ImageDeliveryQuality
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

export interface IconBlockProps {
  /** MUI icon name from IconPicker (e.g. Cloud, Security). */
  iconName: string
  alignment: TextAlign
  iconColor: string
  iconSize: number
  showIconBackground: boolean
  iconBackgroundColor: string
  iconBorderRadius: number
}

export type ContactFormFieldStyle = 'theme' | 'square' | 'rounded' | 'pill'
export type ContactFormSubmitVariant = 'theme' | 'contained' | 'outlined' | 'text'

export interface ContactFormBlockProps {
  title: string
  subtitle?: string
  submitLabel: string
  successMessage: string
  signupLabel: string
  showSignupOption: boolean
  alignment: TextAlign
  /** Solid form panel background color */
  backgroundColor?: string
  /** Form panel opacity (0 = transparent, 100 = solid) */
  backgroundOpacity?: number
  /** When true (default), input fields use a transparent fill instead of Site Styles */
  transparentFieldBackground?: boolean
  fieldStyle?: ContactFormFieldStyle
  fieldBorderRadius?: number
  fieldBorderWidth?: number
  submitVariant?: ContactFormSubmitVariant
  submitColor?: string
  submitBorderRadius?: number
  titleTypography?: TextTypographyOverrides
  bodyTypography?: TextTypographyOverrides
  fieldTypography?: TextTypographyOverrides
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
  icon: IconBlockProps
  contactForm: ContactFormBlockProps
  showcase: ShowcaseBlockProps
  pricing: PricingBlockProps
  faq: FaqBlockProps
  serviceDirectory: ServiceDirectoryBlockProps
  serviceBooking: ServiceBookingBlockProps
  customerBookings: CustomerBookingsBlockProps
  location: LocationBlockProps
}

export interface Block<T extends BlockType = BlockType> {
  id: string
  type: T
  props: BlockPropsMap[T]
}

export type BlockPropsPatch = Partial<Block['props']> | Record<string, string | number | boolean>

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
