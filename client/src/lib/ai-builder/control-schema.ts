import type { BlockType } from '@/features/your-space/types'

export type ControlPropKind = 'color' | 'text' | 'number' | 'enum' | 'boolean'

export type ControlPropGroup = 'content' | 'color' | 'layout' | 'type' | 'motion'

export type ControlProp = {

  /** Prop key on the block. Dotted keys address nested objects such as `typography.fontSize`. */
  key: string
  kind: ControlPropKind
  label: string
  group: ControlPropGroup

  /** Hint shown in the AI panel once the user picks this property. */
  ask?: string
  min?: number
  max?: number
  values?: readonly string[]
  maxLength?: number
}

const ALIGN_VALUES = ['left', 'center', 'right'] as const
const MAX_WIDTH_VALUES = ['sm', 'md', 'lg', 'full'] as const
const BACKGROUND_TYPE_VALUES = ['color', 'pattern', 'gradient', 'photo', 'video'] as const
const HOVER_VALUES = ['none', 'zoom', 'fade', 'lift', 'blur', 'grayscale'] as const
const OVERLAY_VALUES = ['none', 'subtle', 'strong', 'gradient'] as const
const BORDER_STYLE_VALUES = ['none', 'subtle', 'outline', 'elevated', 'inset'] as const
const BUTTON_STYLE_VALUES = ['theme', 'contrast'] as const
const TITLE_STYLE_VALUES = ['solid', 'gradient'] as const
const TRANSFORM_VALUES = ['none', 'uppercase', 'lowercase', 'capitalize'] as const
const DECORATION_VALUES = ['none', 'underline', 'line-through'] as const
const FONT_SOURCE_VALUES = ['heading', 'body', 'custom'] as const

const VISUAL_ANIMATION_VALUES = [
  'static',
  'floating-circles',
  'orbiting-dots',
  'pulse-rings',
  'gradient-shift',
  'morphing-blobs',
  'aurora',
  'mesh-gradient',
  'wave-lines',
  'dot-grid',
  'shimmer',
  'constellation',
  'geometric',
  'particles-rise'
] as const

function color(key: string, label: string, ask: string): ControlProp {
  return { key, kind: 'color', label, group: 'color', ask }
}

function text(key: string, label: string, ask: string, maxLength = 400): ControlProp {
  return { key, kind: 'text', label, group: 'content', ask, maxLength }
}

function num(
  key: string,
  label: string,
  min: number,
  max: number,
  ask: string,
  group: ControlPropGroup = 'layout'
): ControlProp {
  return { key, kind: 'number', label, group, min, max, ask }
}

function pick(
  key: string,
  label: string,
  values: readonly string[],
  ask: string,
  group: ControlPropGroup = 'layout'
): ControlProp {
  return { key, kind: 'enum', label, group, values, ask }
}

function bool(key: string, label: string, ask: string, group: ControlPropGroup = 'layout'): ControlProp {
  return { key, kind: 'boolean', label, group, ask }
}

const alignment = pick('alignment', 'Alignment', ALIGN_VALUES, 'Left, center, or right?', 'layout')

/** Solid/photo background family shared by every section-like control. */
function backgroundProps(key: 'background' | 'backgroundColor'): ControlProp[] {
  return [
    color(key, 'Background', 'A color, or a CSS gradient.'),
    pick('backgroundType', 'Background type', BACKGROUND_TYPE_VALUES, 'Color, gradient, pattern, photo, or video?'),
    num('backgroundOpacity', 'Opacity', 0, 100, 'How opaque, as a percentage?', 'color'),
    num('backgroundPhotoOpacity', 'Photo opacity', 0, 100, 'How opaque should the photo be?', 'color'),
    pick('backgroundPhotoAnimation', 'Photo motion', HOVER_VALUES, 'None, zoom, or fade?', 'motion')
  ]
}

/** Animated background family shared by heroes, sections, headers, and footers. */
const visualProps: ControlProp[] = [
  pick('splitVisualAnimation', 'Animated backdrop', VISUAL_ANIMATION_VALUES, 'Which animated backdrop?', 'motion'),
  color('splitVisualColorStart', 'Backdrop start', 'Starting color of the animated backdrop.'),
  color('splitVisualColorEnd', 'Backdrop end', 'Ending color of the animated backdrop.')
]

/** Per-control typography overrides under a nested key such as `typography` or `navTypography`. */
function typographyProps(prefix: string, label: string): ControlProp[] {
  return [
    pick(`${prefix}.fontSource`, `${label} font`, FONT_SOURCE_VALUES, 'Heading font, body font, or custom?', 'type'),
    text(`${prefix}.fontFamily`, `${label} font family`, 'Which font family?', 120),
    num(`${prefix}.fontSize`, `${label} size`, 8, 200, 'What size in pixels?', 'type'),
    num(`${prefix}.fontWeight`, `${label} weight`, 100, 900, 'How heavy, from 100 to 900?', 'type'),
    pick(`${prefix}.fontStyle`, `${label} style`, ['normal', 'italic'] as const, 'Normal or italic?', 'type'),
    num(`${prefix}.lineHeight`, `${label} line height`, 0.8, 3, 'What line height multiplier?', 'type'),
    num(`${prefix}.letterSpacing`, `${label} letter spacing`, -5, 20, 'How much letter spacing in pixels?', 'type'),
    pick(`${prefix}.textTransform`, `${label} casing`, TRANSFORM_VALUES, 'Normal, uppercase, lowercase, or title case?', 'type'),
    pick(`${prefix}.textDecoration`, `${label} decoration`, DECORATION_VALUES, 'None, underline, or strikethrough?', 'type')
  ]
}

export const CONTROL_SCHEMA: Record<BlockType, ControlProp[]> = {
  header: [
    text('logoText', 'Logo text', 'What should the brand name say?', 80),
    pick('logoPosition', 'Logo position', ALIGN_VALUES, 'Left, center, or right?'),
    pick('layout', 'Layout', ['horizontal', 'vertical'] as const, 'Horizontal or vertical?'),
    color('textColor', 'Text color', 'Which color for the header text?'),
    num('borderRadius', 'Corners', 0, 64, 'How rounded, in pixels?', 'layout'),
    bool('fixed', 'Sticky', 'Should the header stick to the top?'),
    color('logoIconColor', 'Logo icon color', 'Which color for the logo icon?'),
    num('logoIconSize', 'Logo icon size', 8, 96, 'What size in pixels?'),
    ...backgroundProps('backgroundColor'),
    ...visualProps,
    ...typographyProps('logoTypography', 'Logo'),
    ...typographyProps('navTypography', 'Nav')
  ],
  footer: [
    text('logoText', 'Logo text', 'What should the brand name say?', 80),
    text('copyrightText', 'Copyright', 'What should the fine print say?', 200),
    pick('logoPosition', 'Logo position', ALIGN_VALUES, 'Left, center, or right?'),
    pick('layout', 'Layout', ['horizontal', 'vertical'] as const, 'Horizontal or vertical?'),
    color('textColor', 'Text color', 'Which color for the footer text?'),
    num('borderRadius', 'Corners', 0, 64, 'How rounded, in pixels?', 'layout'),
    color('logoIconColor', 'Logo icon color', 'Which color for the logo icon?'),
    ...backgroundProps('backgroundColor'),
    ...visualProps,
    ...typographyProps('copyrightTypography', 'Copyright'),
    ...typographyProps('navTypography', 'Nav')
  ],
  hero: [
    text('title', 'Title', 'What should the hero headline say?', 200),
    text('subtitle', 'Subtitle', 'What supporting line should it use?', 400),
    text('eyebrow', 'Eyebrow', 'What small label sits above the headline?', 80),
    text('buttonText', 'Button label', 'What should the button say?', 60),
    text('buttonLink', 'Button link', 'Where should the button go?', 400),
    text('secondaryButtonText', 'Second button', 'What should the second button say?', 60),
    text('secondaryButtonLink', 'Second button link', 'Where should the second button go?', 400),
    pick('buttonStyle', 'Button treatment', BUTTON_STYLE_VALUES, 'Site theme buttons or contrast buttons?'),
    color('textColor', 'Text color', 'Which color for the hero text?'),
    alignment,
    pick('layout', 'Layout', ['centered', 'split-left', 'split-right'] as const, 'Centered, split left, or split right?', 'layout'),
    pick('verticalAlign', 'Vertical align', ['center', 'bottom'] as const, 'Center or bottom?'),
    num('minHeight', 'Height', 160, 1400, 'How tall in pixels?', 'layout'),
    pick('contentMaxWidth', 'Content width', MAX_WIDTH_VALUES, 'Small, medium, large, or full width?'),
    num('contentPaddingX', 'Side padding', 0, 240, 'How much horizontal padding in pixels?'),
    num('contentPaddingY', 'Vertical padding', 0, 240, 'How much vertical padding in pixels?'),
    num('splitRatio', 'Split ratio', 20, 80, 'What percentage for the content side?'),
    pick('titleStyle', 'Title treatment', TITLE_STYLE_VALUES, 'Solid or gradient headline?', 'type'),
    pick('contentSurface', 'Content surface', ['none', 'glass'] as const, 'Plain or frosted glass panel?'),
    pick('mediaOverlay', 'Media overlay', OVERLAY_VALUES, 'None, subtle, strong, or gradient?', 'color'),
    ...backgroundProps('background'),
    ...visualProps
  ],
  section: [
    num('paddingY', 'Vertical padding', 0, 300, 'How much vertical padding in pixels?', 'layout'),
    num('paddingX', 'Side padding', 0, 300, 'How much horizontal padding in pixels?'),
    pick('maxWidth', 'Content width', MAX_WIDTH_VALUES, 'Small, medium, large, or full width?', 'layout'),
    pick('layout', 'Layout', ['default', 'split-horizontal', 'split-vertical'] as const, 'Single column or split?'),
    num('splitRatio', 'Split ratio', 20, 80, 'What percentage for the first column?'),
    pick('borderStyle', 'Border', BORDER_STYLE_VALUES, 'None, subtle, outline, elevated, or inset?', 'color'),
    num('borderWidth', 'Border width', 0, 16, 'How thick in pixels?'),
    color('borderColor', 'Border color', 'Which border color?'),
    num('borderRadius', 'Corners', 0, 80, 'How rounded, in pixels?', 'layout'),
    pick('splitStyle', 'Split style', ['flush', 'gap', 'divider', 'contrast'] as const, 'Flush, gap, divider, or contrast?'),
    num('splitGap', 'Split gap', 0, 160, 'How much gap in pixels?'),
    color('splitDividerColor', 'Divider color', 'Which divider color?'),
    color('primaryColumnBackground', 'First column background', 'Which color for the first column?'),
    color('secondaryColumnBackground', 'Second column background', 'Which color for the second column?'),
    pick('splitVisualPlacement', 'Backdrop placement', ['background', 'primary', 'secondary'] as const, 'Whole section, first column, or second column?', 'motion'),
    ...backgroundProps('background'),
    ...visualProps
  ],
  carousel: [
    pick('transition', 'Transition', ['slide', 'fade', 'scale', 'coverflow'] as const, 'Slide, fade, scale, or coverflow?', 'motion'),
    bool('autoplay', 'Autoplay', 'Should slides advance on their own?', 'motion'),
    num('autoplayInterval', 'Autoplay interval', 1000, 20000, 'How many milliseconds between slides?', 'motion'),
    bool('loop', 'Loop', 'Should it loop back to the first slide?', 'motion'),
    bool('showArrows', 'Arrows', 'Show the arrows?'),
    bool('showDots', 'Dots', 'Show the position dots?'),
    pick('arrowStyle', 'Arrow style', ['minimal', 'rounded', 'floating'] as const, 'Minimal, rounded, or floating?'),
    pick('dotStyle', 'Dot style', ['dots', 'lines', 'fraction'] as const, 'Dots, lines, or a fraction?'),
    num('slidesPerView', 'Slides in view', 1, 6, 'How many slides at once?', 'layout'),
    num('slideGap', 'Slide gap', 0, 120, 'How much gap in pixels?'),
    num('slidePeek', 'Slide peek', 0, 200, 'How many pixels of the next slide should show?'),
    num('transitionDuration', 'Transition speed', 100, 3000, 'How many milliseconds per transition?', 'motion'),
    num('paddingY', 'Vertical padding', 0, 300, 'How much vertical padding in pixels?'),
    num('paddingX', 'Side padding', 0, 300, 'How much horizontal padding in pixels?'),
    pick('maxWidth', 'Content width', MAX_WIDTH_VALUES, 'Small, medium, large, or full width?'),
    num('borderRadius', 'Corners', 0, 80, 'How rounded, in pixels?', 'layout'),
    num('slideMinHeight', 'Slide height', 80, 1200, 'How tall in pixels?'),
    color('arrowColor', 'Arrow color', 'Which arrow color?'),
    color('dotColor', 'Dot color', 'Which dot color?'),
    ...backgroundProps('background'),
    ...visualProps
  ],
  tabs: [
    pick('orientation', 'Orientation', ['horizontal', 'vertical'] as const, 'Horizontal or vertical?', 'layout'),
    pick('variant', 'Tab style', ['underline', 'pills', 'segmented', 'bordered', 'elevated'] as const, 'Underline, pills, segmented, bordered, or elevated?', 'layout'),
    color('activeTabColor', 'Active tab color', 'Which color for the active tab?'),
    color('inactiveTabColor', 'Inactive tab color', 'Which color for the inactive tabs?'),
    color('indicatorColor', 'Indicator color', 'Which color for the indicator?'),
    color('tabBackgroundColor', 'Tab bar background', 'Which color behind the tabs?'),
    color('contentBackgroundColor', 'Content background', 'Which color behind the tab content?'),
    num('tabBorderRadius', 'Tab corners', 0, 80, 'How rounded, in pixels?', 'layout'),
    num('contentBorderRadius', 'Content corners', 0, 80, 'How rounded, in pixels?'),
    num('tabGap', 'Tab gap', 0, 80, 'How much gap in pixels?'),
    num('paddingY', 'Vertical padding', 0, 300, 'How much vertical padding in pixels?'),
    num('paddingX', 'Side padding', 0, 300, 'How much horizontal padding in pixels?'),
    pick('maxWidth', 'Content width', MAX_WIDTH_VALUES, 'Small, medium, large, or full width?'),
    num('contentMinHeight', 'Content height', 0, 1200, 'How tall in pixels?'),
    bool('fullWidthTabs', 'Full width tabs', 'Should the tabs stretch to fill the bar?'),
    pick('contentAnimation', 'Content animation', ['none', 'fade', 'slide-up', 'slide-horizontal', 'scale'] as const, 'None, fade, slide, or scale?', 'motion'),
    num('animationDuration', 'Animation speed', 50, 2000, 'How many milliseconds?', 'motion'),
    pick('tabBarBorderStyle', 'Tab bar border', BORDER_STYLE_VALUES, 'None, subtle, outline, elevated, or inset?', 'color'),
    num('tabBarBorderWidth', 'Tab bar border width', 0, 16, 'How thick in pixels?'),
    color('tabBarBorderColor', 'Tab bar border color', 'Which border color?'),
    num('tabBarBorderRadius', 'Tab bar corners', 0, 80, 'How rounded, in pixels?'),
    pick('contentBorderStyle', 'Content border', BORDER_STYLE_VALUES, 'None, subtle, outline, elevated, or inset?', 'color'),
    num('contentBorderWidth', 'Content border width', 0, 16, 'How thick in pixels?'),
    color('contentBorderColor', 'Content border color', 'Which border color?'),
    ...typographyProps('tabTypography', 'Tab label')
  ],
  heading: [
    text('text', 'Text', 'What should the heading say?', 300),
    pick('level', 'Level', ['1', '2', '3'] as const, 'Level 1, 2, or 3?', 'type'),
    alignment,
    color('color', 'Text color', 'Which color for the heading?'),
    pick('variant', 'Treatment', ['default', 'display', 'eyebrow', 'script'] as const, 'Default, display, eyebrow, or script?', 'type'),
    ...typographyProps('typography', 'Text')
  ],
  text: [
    text('text', 'Text', 'What should the text say?', 2000),
    alignment,
    color('color', 'Text color', 'Which color for the text?'),
    pick(
      'variant',
      'Treatment',
      ['paragraph', 'lead', 'quote', 'pullquote', 'testimonial', 'calligraphy', 'caption', 'callout'] as const,
      'Paragraph, lead, quote, pull quote, review, calligraphy, caption, or callout?',
      'type'
    ),
    text('cite', 'Attribution', 'Who said it?', 120),
    text('citeRole', 'Attribution role', 'What is their role or company?', 120),
    color('accentColor', 'Accent color', 'Which color for the quote bar or callout edge?'),
    ...typographyProps('typography', 'Text')
  ],
  button: [
    text('text', 'Label', 'What should the button say?', 60),
    text('link', 'Link', 'Where should it go?', 400),
    pick('variant', 'Style', ['contained', 'outlined', 'text'] as const, 'Filled, outlined, or text only?', 'layout'),
    alignment,
    color('color', 'Color', 'Which color for the button?'),
    num('borderRadius', 'Corners', 0, 80, 'How rounded, in pixels?', 'layout')
  ],
  image: [
    text('alt', 'Alt text', 'How should the image be described?', 200),
    alignment,
    pick('hoverEffect', 'Hover effect', HOVER_VALUES, 'None, zoom, or fade?', 'motion'),
    num('borderRadius', 'Corners', 0, 400, 'How rounded, in pixels?', 'layout'),
    num('opacity', 'Opacity', 0, 100, 'How opaque, as a percentage?', 'color'),
    pick('entranceAnimation', 'Entrance', ['none', 'fade-in', 'slide-up', 'zoom-in', 'blur-in', 'flip-up'] as const, 'Which entrance animation?', 'motion'),
    pick('continuousAnimation', 'Looping motion', ['none', 'float', 'pulse', 'breathe', 'shimmer', 'swing'] as const, 'Which looping animation?', 'motion')
  ],
  video: [
    alignment,
    bool('autoplay', 'Autoplay', 'Should it play automatically?', 'motion'),
    bool('muted', 'Muted', 'Should it start muted?', 'motion'),
    bool('loop', 'Loop', 'Should it loop?', 'motion'),
    bool('controls', 'Controls', 'Show the player controls?'),
    num('borderRadius', 'Corners', 0, 400, 'How rounded, in pixels?', 'layout')
  ],
  logo: [
    text('alt', 'Alt text', 'How should the logo be described?', 200),
    text('link', 'Link', 'Where should it go?', 400),
    alignment,
    num('maxHeight', 'Height', 16, 400, 'How tall in pixels?', 'layout')
  ],
  shape: [
    pick('variant', 'Shape', ['rectangle', 'circle', 'ellipse', 'triangle', 'diamond', 'star', 'line'] as const, 'Which shape?', 'layout'),
    alignment,
    num('width', 'Width', 4, 2000, 'How wide in pixels?'),
    num('height', 'Height', 1, 2000, 'How tall in pixels?'),
    pick('fillType', 'Fill', ['solid', 'gradient'] as const, 'Solid or gradient?', 'color'),
    color('fillColor', 'Fill color', 'Which fill color?'),
    color('gradientStart', 'Gradient start', 'Which starting color?'),
    color('gradientEnd', 'Gradient end', 'Which ending color?'),
    num('gradientAngle', 'Gradient angle', 0, 360, 'What angle in degrees?'),
    pick('gradientStyle', 'Gradient style', ['linear', 'radial'] as const, 'Linear or radial?', 'color'),
    num('strokeWidth', 'Stroke width', 0, 40, 'How thick in pixels?'),
    color('strokeColor', 'Stroke color', 'Which stroke color?'),
    num('opacity', 'Opacity', 0, 100, 'How opaque, as a percentage?', 'color'),
    num('rotation', 'Rotation', -360, 360, 'How many degrees?'),
    num('borderRadius', 'Corners', 0, 400, 'How rounded, in pixels?', 'layout'),
    pick(
      'lineStyle',
      'Line style',
      ['solid', 'dashed', 'dotted', 'double', 'fade', 'ornament', 'feather', 'brush', 'sword', 'wave', 'flourish'] as const,
      'Which divider line style?'
    )
  ],
  icon: [
    text('iconName', 'Icon', 'Which Material icon name?', 60),
    alignment,
    color('iconColor', 'Icon color', 'Which icon color?'),
    num('iconSize', 'Icon size', 8, 400, 'What size in pixels?', 'layout'),
    bool('showIconBackground', 'Icon background', 'Show a background behind the icon?', 'color'),
    color('iconBackgroundColor', 'Icon background color', 'Which background color?'),
    num('iconBorderRadius', 'Corners', 0, 400, 'How rounded, in pixels?', 'layout')
  ],
  contactForm: [
    text('title', 'Title', 'What should the form title say?', 160),
    text('subtitle', 'Supporting text', 'What supporting text should it use?', 400),
    text('submitLabel', 'Submit label', 'What should the submit button say?', 60),
    text('successMessage', 'Success message', 'What should it say after sending?', 300),
    text('signupLabel', 'Signup label', 'What should the signup option say?', 160),
    bool('showSignupOption', 'Signup option', 'Show the signup checkbox?'),
    alignment,
    color('backgroundColor', 'Background', 'Which color for the form panel?'),
    num('backgroundOpacity', 'Opacity', 0, 100, 'How opaque, as a percentage?', 'color'),
    bool('transparentFieldBackground', 'Transparent fields', 'Should input fields be transparent?', 'color'),
    pick('fieldStyle', 'Field shape', ['theme', 'square', 'rounded', 'pill'] as const, 'Theme, square, rounded, or pill?', 'layout'),
    num('fieldBorderRadius', 'Field corners', 0, 80, 'How rounded, in pixels?'),
    num('fieldBorderWidth', 'Field border width', 0, 8, 'How thick in pixels?'),
    pick('submitVariant', 'Submit style', ['theme', 'contained', 'outlined', 'text'] as const, 'Theme, filled, outlined, or text only?'),
    color('submitColor', 'Submit color', 'Which color for the submit button?'),
    num('submitBorderRadius', 'Submit corners', 0, 80, 'How rounded, in pixels?'),
    ...typographyProps('titleTypography', 'Title'),
    ...typographyProps('bodyTypography', 'Body')
  ],
  showcase: [
    pick('layout', 'Layout', ['split', 'stack', 'cards'] as const, 'Split, stack, or cards?', 'layout'),
    pick('columns', 'Columns', ['1', '2', '3'] as const, 'One, two, or three columns?', 'layout'),
    pick('mediaSide', 'Media side', ['start', 'end'] as const, 'Media first or last?'),
    pick('cardStyle', 'Card style', ['layered', 'stacked'] as const, 'Layered or stacked?', 'layout'),
    alignment,
    color('textColor', 'Text color', 'Which color for the text?'),
    num('minHeight', 'Height', 0, 1400, 'How tall in pixels?'),
    num('paddingY', 'Vertical padding', 0, 300, 'How much vertical padding in pixels?'),
    num('paddingX', 'Side padding', 0, 300, 'How much horizontal padding in pixels?'),
    pick('maxWidth', 'Content width', MAX_WIDTH_VALUES, 'Small, medium, large, or full width?'),
    num('splitRatio', 'Split ratio', 20, 80, 'What percentage for the content side?'),
    num('gap', 'Gap', 0, 160, 'How much gap in pixels?'),
    num('mediaRadius', 'Media corners', 0, 200, 'How rounded, in pixels?', 'layout'),
    pick('mediaOverlay', 'Media overlay', OVERLAY_VALUES, 'None, subtle, strong, or gradient?', 'color'),
    pick('buttonStyle', 'Button treatment', BUTTON_STYLE_VALUES, 'Site theme buttons or contrast buttons?'),
    pick('titleStyle', 'Title treatment', TITLE_STYLE_VALUES, 'Solid or gradient headline?', 'type'),
    ...backgroundProps('background'),
    ...visualProps
  ],
  pricing: [
    text('eyebrow', 'Eyebrow', 'What small label sits above the title?', 80),
    text('title', 'Title', 'What should the pricing title say?', 160),
    text('subtitle', 'Subtitle', 'What supporting text should it use?', 400),
    alignment,
    pick('layout', 'Layout', ['cards', 'comparison', 'stack'] as const, 'Cards, comparison, or stack?', 'layout'),
    pick('cardStyle', 'Card style', ['elevated', 'outlined', 'filled', 'tinted', 'glass'] as const, 'Elevated, outlined, filled, tinted, or glass?', 'layout'),
    pick('columns', 'Columns', ['2', '3', '4'] as const, 'Two, three, or four columns?', 'layout'),
    bool('showIntervalToggle', 'Interval toggle', 'Show the monthly/annual toggle?'),
    pick('defaultInterval', 'Default interval', ['monthly', 'annual'] as const, 'Monthly or annual?'),
    text('monthlyLabel', 'Monthly label', 'What should the monthly option say?', 60),
    text('annualLabel', 'Annual label', 'What should the annual option say?', 60),
    text('annualBadge', 'Annual badge', 'What should the annual badge say?', 60),
    text('currency', 'Currency', 'Which currency symbol or code?', 8),
    bool('showYearlyTotal', 'Yearly total', 'Show the yearly total?'),
    num('paddingY', 'Vertical padding', 0, 300, 'How much vertical padding in pixels?'),
    num('paddingX', 'Side padding', 0, 300, 'How much horizontal padding in pixels?'),
    pick('maxWidth', 'Content width', MAX_WIDTH_VALUES, 'Small, medium, large, or full width?'),
    num('gap', 'Gap', 0, 160, 'How much gap in pixels?'),
    num('cardRadius', 'Card corners', 0, 200, 'How rounded, in pixels?', 'layout'),
    color('textColor', 'Text color', 'Which color for the text?'),
    color('accentColor', 'Accent color', 'Which accent color?'),
    color('cardBackground', 'Card background', 'Which color for the cards?'),
    color('cardBorderColor', 'Card border color', 'Which border color?'),
    num('cardBorderWidth', 'Card border width', 0, 16, 'How thick in pixels?'),
    pick('cardShadow', 'Card shadow', ['none', 'soft', 'medium', 'strong'] as const, 'None, soft, medium, or strong?', 'color'),
    bool('recommendedScale', 'Highlight recommended', 'Should the recommended plan stand taller?'),
    bool('recommendedGlow', 'Recommended glow', 'Should the recommended plan glow?', 'color'),
    pick('buttonStyle', 'Button treatment', BUTTON_STYLE_VALUES, 'Site theme buttons or contrast buttons?'),
    pick('titleStyle', 'Title treatment', TITLE_STYLE_VALUES, 'Solid or gradient headline?', 'type'),
    pick('hoverEffect', 'Hover effect', ['none', 'lift', 'glow'] as const, 'None, lift, or glow?', 'motion'),
    pick('entranceAnimation', 'Entrance', ['none', 'fade-in', 'slide-up'] as const, 'None, fade in, or slide up?', 'motion'),
    pick('featureIconStyle', 'Feature icons', ['check', 'dot', 'none'] as const, 'Checks, dots, or none?'),
    ...backgroundProps('background')
  ],
  serviceDirectory: [
    text('title', 'Title', 'What should the services title say?', 160),
    text('subtitle', 'Subtitle', 'What supporting text should it use?', 400),
    text('category', 'Category filter', 'Which category should it show?', 80),
    pick('layout', 'Layout', ['cards', 'list', 'featured'] as const, 'Cards, list, or featured?', 'layout'),
    bool('showSearch', 'Search', 'Show the search box?'),
    bool('showCategory', 'Category', 'Show the category filter?'),
    bool('showPrice', 'Price', 'Show prices?'),
    bool('showDuration', 'Duration', 'Show durations?'),
    bool('showAvailability', 'Availability', 'Show availability?'),
    text('ctaLabel', 'Button label', 'What should the button say?', 60),
    alignment,
    ...backgroundProps('background'),
    ...visualProps
  ],
  serviceBooking: [
    text('title', 'Title', 'What should the booking title say?', 160),
    text('subtitle', 'Supporting text', 'What supporting text should it use?', 400),
    pick('layout', 'Layout', ['inline', 'compact'] as const, 'Full panel or compact?', 'layout'),
    bool('showServiceSummary', 'Service summary', 'Show the service summary?'),
    bool('showTimezone', 'Timezone note', 'Show the timezone note?'),
    text('ctaLabel', 'Button label', 'What should the button say?', 60),
    alignment,
    ...backgroundProps('background'),
    ...visualProps
  ],
  customerBookings: [
    text('title', 'Title', 'What should the title say?', 160),
    text('subtitle', 'Subtitle', 'What supporting text should it use?', 400),
    alignment,
    ...backgroundProps('background'),
    ...visualProps
  ],
  location: [
    text('title', 'Title', 'What should the title say?', 160),
    text('subtitle', 'Subtitle', 'What supporting text should it use?', 400),
    text('address', 'Address', 'Which address should it show?', 300),
    bool('showMap', 'Map', 'Show the map?'),
    num('mapZoom', 'Map zoom', 1, 21, 'What zoom level, from 1 to 21?', 'layout'),
    pick('mapStyle', 'Map style', ['theme', 'standard', 'muted', 'monochrome', 'warm'] as const, 'Theme, standard, muted, monochrome, or warm?', 'color'),
    bool('showMapControls', 'Map controls', 'Show the map controls?'),
    alignment,
    ...backgroundProps('background'),
    ...visualProps
  ]
}

const SCHEMA_INDEX: Record<string, Map<string, ControlProp>> = Object.fromEntries(
  Object.entries(CONTROL_SCHEMA).map(([type, props]) => [type, new Map(props.map(prop => [prop.key, prop]))])
)

export function getControlProps(type: BlockType): ControlProp[] {
  return CONTROL_SCHEMA[type] ?? []
}

export function getControlProp(type: BlockType, key: string): ControlProp | undefined {
  return SCHEMA_INDEX[type]?.get(key)
}

const CSS_COLOR_KEYWORDS = new Set([
  'transparent',
  'currentcolor',
  'inherit',
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen'
])

const HEX_PATTERN = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const FUNCTIONAL_COLOR_PATTERN = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\([^;{}]*\)$/i
const GRADIENT_PATTERN = /^(?:repeating-)?(?:linear|radial|conic)-gradient\([^;{}]*\)$/i
const CSS_VAR_PATTERN = /^var\(--[a-z0-9-]+(?:,[^;{}]*)?\)$/i
const UNSAFE_PATTERN = /url\(|javascript:|expression\(|@import|<|>/i

/**
 * Accepts any color a designer would reasonably write while rejecting anything
 * that could smuggle a remote request or extra declarations into inline styles.
 */
export function isSafeColorValue(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }

  const trimmed = value.trim()

  if (trimmed.length === 0 || trimmed.length > 300 || UNSAFE_PATTERN.test(trimmed)) {
    return false
  }

  return (
    HEX_PATTERN.test(trimmed) ||
    CSS_COLOR_KEYWORDS.has(trimmed.toLowerCase()) ||
    FUNCTIONAL_COLOR_PATTERN.test(trimmed) ||
    GRADIENT_PATTERN.test(trimmed) ||
    CSS_VAR_PATTERN.test(trimmed)
  )
}

const TRUE_WORDS = new Set(['true', 'yes', 'on', 'show', 'shown', 'visible', 'enable', 'enabled', '1'])
const FALSE_WORDS = new Set(['false', 'no', 'off', 'hide', 'hidden', 'disable', 'disabled', '0'])

function coerceNumber(prop: ControlProp, value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value).replace(/[^\d.-]/g, ''))

  if (!Number.isFinite(parsed)) {
    return null
  }

  const min = prop.min ?? Number.NEGATIVE_INFINITY
  const max = prop.max ?? Number.POSITIVE_INFINITY
  const clamped = Math.min(max, Math.max(min, parsed))

  return Math.round(clamped * 100) / 100
}

/** Everyday wording that means an existing enum value. */
const ENUM_ALIASES: Record<string, string> = {
  centre: 'center',
  centered: 'center',
  middle: 'center',
  start: 'left',
  end: 'right',
  caps: 'uppercase',
  capitals: 'uppercase',
  'all caps': 'uppercase',
  'title case': 'capitalize',
  titlecase: 'capitalize',
  sentence: 'none',
  strike: 'line-through',
  strikethrough: 'line-through',
  oblique: 'italic',
  fill: 'contained',
  filled: 'contained',
  solid: 'contained',
  outline: 'outlined',
  ghost: 'text',
  link: 'text',
  first: 'start',
  last: 'end',
  square: 'square',
  sharp: 'square',
  full: 'full',
  fullwidth: 'full',
  wide: 'lg',
  narrow: 'sm'
}

function coerceEnum(prop: ControlProp, value: unknown): string | number | null {
  const raw = String(value).trim().toLowerCase()
  const candidate = prop.values?.some(option => option.toLowerCase() === raw) ? raw : (ENUM_ALIASES[raw] ?? raw)
  const match = prop.values?.find(option => option.toLowerCase() === candidate)

  if (match === undefined) {
    return null
  }

  // Numeric enums (heading level, column counts) are stored as numbers.
  return /^\d+$/.test(match) ? Number(match) : match
}

export type CoercedProps = Record<string, string | number | boolean | Record<string, string | number | boolean>>

export type CoerceResult = {
  props: CoercedProps
  rejected: string[]
}

/**
 * Validate a proposed prop patch against the control schema. Dotted keys are
 * folded into nested objects, merged over `existingProps` so a single override
 * never wipes the sibling values.
 */
export function coerceControlProps(
  type: BlockType,
  patch: Record<string, unknown>,
  existingProps?: Record<string, unknown>
): CoerceResult {
  const props: CoercedProps = {}
  const rejected: string[] = []

  for (const [rawKey, rawValue] of Object.entries(patch)) {
    const prop = getControlProp(type, rawKey)

    if (!prop || rawValue === null || rawValue === undefined) {
      rejected.push(rawKey)
      continue
    }

    let value: string | number | boolean | null = null

    if (prop.kind === 'color') {
      value = isSafeColorValue(rawValue) ? rawValue.trim() : null
    } else if (prop.kind === 'number') {
      value = coerceNumber(prop, rawValue)
    } else if (prop.kind === 'enum') {
      value = coerceEnum(prop, rawValue)
    } else if (prop.kind === 'boolean') {
      const word = String(rawValue).trim().toLowerCase()

      value = typeof rawValue === 'boolean' ? rawValue : TRUE_WORDS.has(word) ? true : FALSE_WORDS.has(word) ? false : null
    } else {
      const asText = String(rawValue)

      value = asText.length > 0 ? asText.slice(0, prop.maxLength ?? 400) : null
    }

    if (value === null) {
      rejected.push(rawKey)
      continue
    }

    const [parent, child] = prop.key.split('.')

    if (child) {
      const current = props[parent]

      const base =
        current && typeof current === 'object'
          ? current
          : ((existingProps?.[parent] as Record<string, string | number | boolean> | undefined) ?? {})

      props[parent] = { ...base, [child]: value }
    } else {
      props[parent] = value
    }
  }

  return { props, rejected }
}

/**
 * Compact, model-facing capability listing. Only the control types in play are
 * serialized so the prompt stays small regardless of how many controls exist.
 */
export function describeControlCapabilities(types: BlockType[]): string {
  const unique = Array.from(new Set(types))

  return unique
    .map(type => {
      const props = getControlProps(type)
        .map(prop => {
          if (prop.kind === 'enum') {
            return `${prop.key}(${prop.values?.join('|')})`
          }

          if (prop.kind === 'number') {
            return `${prop.key}(num ${prop.min}-${prop.max})`
          }

          if (prop.kind === 'color') {
            return `${prop.key}(color)`
          }

          if (prop.kind === 'boolean') {
            return `${prop.key}(bool)`
          }

          return `${prop.key}(text)`
        })
        .join(' ')

      return `${type}: ${props}`
    })
    .join('\n')
}
