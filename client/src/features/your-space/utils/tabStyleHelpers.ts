import type { SxProps, Theme } from '@mui/material/styles'
import { alpha, keyframes } from '@mui/material/styles'

import type {
  TabBorderStyle,
  TabContentAnimation,
  TabOrientation,
  TabVariant,
  TabsBlockProps
} from '../types'
import { siteCanvasBelow } from './siteResponsiveHelpers'
import { SITE_BUTTON_ACTIVE_SX, SITE_BUTTON_HOVER_SX, SITE_INTERACTIVE_TRANSITION } from './siteInteractiveHelpers'

const MAX_WIDTH_MAP = {
  sm: 640,
  md: 768,
  lg: 1024,
  full: '100%'
} as const

export function getTabsMaxWidth(maxWidth: TabsBlockProps['maxWidth']) {
  return MAX_WIDTH_MAP[maxWidth]
}

export function getTabBorderFrameSx(
  borderStyle: TabBorderStyle,
  borderWidth: number,
  borderColor: string,
  borderRadius: number
): SxProps<Theme> {
  switch (borderStyle) {
    case 'subtle':
      return {
        border: '1px solid',
        borderColor: 'divider',
        borderRadius,
        overflow: 'hidden'
      }
    case 'outline':
      return {
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius,
        overflow: 'hidden'
      }
    case 'elevated':
      return {
        borderRadius,
        border: '1px solid',
        borderColor: alpha('#000', 0.06),
        boxShadow: '0 4px 24px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden'
      }
    case 'inset':
      return {
        borderRadius,
        border: '1px solid',
        borderColor: alpha('#000', 0.08),
        backgroundColor: alpha('#000', 0.02),
        overflow: 'hidden'
      }
    default:
      return borderRadius > 0 ? { borderRadius, overflow: 'hidden' } : {}
  }
}

export function getTabsShellSx(props: TabsBlockProps): SxProps<Theme> {
  return {
    py: `${props.paddingY}px`,
    px: `${props.paddingX}px`,
    ...siteCanvasBelow({
      ...(props.paddingX > 16 ? { px: `${Math.min(props.paddingX, 16)}px` } : {}),
      ...(props.paddingY > 32 ? { py: `${Math.min(props.paddingY, 32)}px` } : {})
    })
  }
}

const tabsListMobileScrollSx = {
  flexDirection: 'row',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  overflowY: 'hidden',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
  minWidth: 'unset',
  maxWidth: 'none',
  width: '100%',
  pb: 0.5,
  '& > [data-tab-button-wrapper]': { flex: '0 0 auto' },
  '& > [data-tab-button-wrapper] > button': { width: 'auto' }
} as const

export function getTabsContainerSx(props: TabsBlockProps): SxProps<Theme> {
  const isVertical = props.orientation === 'vertical'

  return {
    display: 'flex',
    flexDirection: isVertical ? 'row' : 'column',
    gap: isVertical ? 2 : 1.5,
    alignItems: isVertical ? 'stretch' : undefined,
    minWidth: 0,
    ...siteCanvasBelow({
      flexDirection: 'column',
      gap: 1.25,
      alignItems: 'stretch'
    })
  }
}

export function getTabsListSx(props: TabsBlockProps, theme: Theme): SxProps<Theme> {
  const isVertical = props.orientation === 'vertical'
  const isSegmented = props.variant === 'segmented'
  const barFrame = getTabBorderFrameSx(
    props.tabBarBorderStyle,
    props.tabBarBorderWidth,
    props.tabBarBorderColor,
    props.tabBarBorderRadius
  )

  return {
    position: 'relative',
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    flexWrap: isVertical ? 'nowrap' : 'wrap',
    gap: isSegmented ? 0 : `${props.tabGap}px`,
    flexShrink: 0,
    ...(isVertical ? { minWidth: 160, maxWidth: 220 } : {}),
    ...(props.fullWidthTabs && !isVertical
      ? {
          width: '100%',
          '& > [data-tab-button-wrapper]': { flex: 1 },
          '& > [data-tab-button-wrapper] > button': { width: '100%' }
        }
      : {}),
    ...(isSegmented
      ? {
          p: 0.375,
          borderRadius: props.tabBarBorderRadius || 2,
          backgroundColor: alpha(theme.palette.text.primary, 0.06),
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`
        }
      : props.tabBarBorderStyle !== 'none'
        ? { p: 0.75, ...barFrame }
        : {}),
    ...(props.variant === 'bordered' && !isVertical && props.tabBarBorderStyle === 'none'
      ? {
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
        }
      : {}),
    ...siteCanvasBelow(tabsListMobileScrollSx)
  }
}

export function getTabButtonSx(
  props: TabsBlockProps,
  isActive: boolean,
  theme: Theme
): SxProps<Theme> {
  const isVertical = props.orientation === 'vertical'
  const accent = props.indicatorColor
  const activeColor = props.activeTabColor
  const inactiveColor = props.inactiveTabColor
  const tabBg = props.tabBackgroundColor
  const radius = props.tabBorderRadius ?? 2
  const useSlidingIndicator = props.variant === 'underline'

  const base: SxProps<Theme> = {
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 600,
    fontSize: isVertical ? '0.8125rem' : '0.875rem',
    lineHeight: 1.4,
    color: isActive ? activeColor : inactiveColor,
    backgroundColor: 'transparent',
    transition: SITE_INTERACTIVE_TRANSITION,
    whiteSpace: 'nowrap',
    textAlign: isVertical ? 'left' : 'center',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: isVertical ? 'flex-start' : 'center',
    gap: 0.75,
    minWidth: 0,
    position: 'relative',
    '&:hover': {
      color: activeColor,
      ...(isActive ? {} : SITE_BUTTON_HOVER_SX)
    },
    '&:active': isActive ? { transform: 'scale(0.98)' } : SITE_BUTTON_ACTIVE_SX,
    ...siteCanvasBelow({
      fontSize: '0.8125rem',
      flexShrink: 0,
      ...(isVertical ? {} : { px: 1.5, py: 1.125 })
    })
  }

  const mobileButtonOverrides = siteCanvasBelow({
    ...(isVertical ? { width: 'auto', justifyContent: 'center' } : {}),
    ...(props.variant === 'bordered' && !isVertical
      ? {
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
          mb: 0
        }
      : {})
  })

  switch (props.variant) {
    case 'underline':
      return {
        ...base,
        px: isVertical ? 1.5 : 2,
        py: isVertical ? 1.25 : 1.5,
        borderRadius: isVertical ? radius : 0,
        borderBottom: useSlidingIndicator || isVertical ? 'none' : `2px solid ${isActive ? accent : 'transparent'}`,
        borderLeft:
          useSlidingIndicator && isVertical
            ? 'none'
            : isVertical
              ? `3px solid ${isActive ? accent : 'transparent'}`
              : 'none',
        backgroundColor: isVertical && isActive ? alpha(accent, 0.06) : 'transparent',
        mb: isVertical ? 0 : useSlidingIndicator ? 0 : '-1px',
        ...mobileButtonOverrides
      }

    case 'pills':
      return {
        ...base,
        px: 2,
        py: 1,
        borderRadius: 999,
        backgroundColor: isActive
          ? alpha(accent, 0.12)
          : tabBg !== 'transparent'
            ? tabBg
            : alpha(theme.palette.text.primary, 0.04),
        color: isActive ? accent : inactiveColor,
        boxShadow: isActive ? `0 0 0 1px ${alpha(accent, 0.2)}` : 'none',
        '&:hover': {
          ...(!isActive ? SITE_BUTTON_HOVER_SX : {}),
          backgroundColor: isActive ? alpha(accent, 0.16) : alpha(accent, 0.06),
          color: isActive ? accent : activeColor
        },
        '&:active': SITE_BUTTON_ACTIVE_SX,
        ...mobileButtonOverrides
      }

    case 'segmented':
      return {
        ...base,
        flex: props.fullWidthTabs && !isVertical ? 1 : undefined,
        px: 2,
        py: 1,
        borderRadius: radius,
        backgroundColor: isActive ? theme.palette.background.paper : 'transparent',
        color: isActive ? activeColor : inactiveColor,
        boxShadow: isActive ? `0 1px 4px ${alpha(theme.palette.common.black, 0.1)}` : 'none',
        transform: isActive ? 'scale(1)' : undefined,
        '&:hover': {
          ...(!isActive ? SITE_BUTTON_HOVER_SX : {}),
          color: activeColor
        },
        '&:active': SITE_BUTTON_ACTIVE_SX,
        ...siteCanvasBelow({ flex: '0 0 auto', minWidth: 'max-content' }),
        ...mobileButtonOverrides
      }

    case 'bordered':
      return {
        ...base,
        px: 2,
        py: 1.25,
        borderRadius: radius,
        border: `${props.contentBorderWidth ?? 1}px solid ${isActive ? accent : alpha(theme.palette.divider, 0.25)}`,
        backgroundColor: isActive ? alpha(accent, 0.04) : tabBg !== 'transparent' ? tabBg : 'transparent',
        ...(isVertical
          ? { width: '100%' }
          : {
              borderBottomLeftRadius: isActive ? 0 : radius,
              borderBottomRightRadius: isActive ? 0 : radius,
              borderBottomColor: isActive ? alpha(accent, 0.04) : alpha(theme.palette.divider, 0.25),
              mb: isActive ? '-1px' : 0,
              zIndex: isActive ? 1 : 0
            }),
        ...mobileButtonOverrides
      }

    case 'elevated':
      return {
        ...base,
        px: 2,
        py: 1.25,
        borderRadius: radius,
        width: isVertical ? '100%' : undefined,
        backgroundColor: isActive
          ? theme.palette.background.paper
          : tabBg !== 'transparent'
            ? tabBg
            : alpha(theme.palette.text.primary, 0.03),
        boxShadow: isActive
          ? `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}, 0 0 0 1px ${alpha(theme.palette.divider, 0.08)}`
          : 'none',
        color: isActive ? activeColor : inactiveColor,
        transform: isActive ? 'translateY(-1px)' : 'none',
        '&:hover': {
          backgroundColor: isActive ? theme.palette.background.paper : alpha(theme.palette.text.primary, 0.06),
          transform: isActive ? 'translateY(-1px)' : 'translateY(-2px)',
          boxShadow: isActive
            ? `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}, 0 0 0 1px ${alpha(theme.palette.divider, 0.08)}`
            : `0 4px 14px ${alpha(theme.palette.common.black, 0.08)}`
        },
        '&:active': SITE_BUTTON_ACTIVE_SX,
        ...siteCanvasBelow({ width: 'auto' }),
        ...mobileButtonOverrides
      }

    default:
      return { ...base, ...mobileButtonOverrides }
  }
}

export function getTabsContentSx(props: TabsBlockProps, theme: Theme): SxProps<Theme> {
  const isVertical = props.orientation === 'vertical'
  const contentBg = props.contentBackgroundColor
  const borderFrame = getTabBorderFrameSx(
    props.contentBorderStyle,
    props.contentBorderWidth,
    props.contentBorderColor,
    props.contentBorderRadius
  )

  return {
    flex: 1,
    minWidth: 0,
    minHeight: props.contentMinHeight,
    backgroundColor: contentBg !== 'transparent' ? contentBg : alpha(theme.palette.text.primary, 0.02),
    ...(props.contentBorderStyle !== 'none'
      ? borderFrame
      : {
          borderRadius: `${props.contentBorderRadius}px`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }),
    ...(props.variant === 'bordered' && !isVertical
      ? {
          borderTopLeftRadius: 0,
          mt: -0.125
        }
      : {}),
    ...siteCanvasBelow({
      minHeight: Math.min(props.contentMinHeight, 160),
      width: '100%',
      ...(props.variant === 'bordered'
        ? {
            borderTopLeftRadius: `${props.contentBorderRadius}px`,
            mt: 0
          }
        : {})
    })
  }
}

export function getTabIndicatorSx(
  props: TabsBlockProps,
  indicator: { left: number; top: number; width: number; height: number },
  useVerticalIndicator: boolean
): SxProps<Theme> {
  const duration = props.animationDuration ?? 280

  if (useVerticalIndicator) {
    return {
      position: 'absolute',
      left: 0,
      top: indicator.top,
      width: 3,
      height: indicator.height,
      borderRadius: 1.5,
      backgroundColor: props.indicatorColor,
      transition: `top ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), height ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      pointerEvents: 'none',
      zIndex: 2
    }
  }

  return {
    position: 'absolute',
    left: indicator.left,
    bottom: 0,
    width: indicator.width,
    height: 3,
    borderRadius: '3px 3px 0 0',
    backgroundColor: props.indicatorColor,
    transition: `left ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    pointerEvents: 'none',
    zIndex: 2
  }
}

const tabFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const tabSlideUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`

const tabSlideFromRight = keyframes`
  from { opacity: 0; transform: translateX(18px); }
  to { opacity: 1; transform: translateX(0); }
`

const tabSlideFromLeft = keyframes`
  from { opacity: 0; transform: translateX(-18px); }
  to { opacity: 1; transform: translateX(0); }
`

const tabScaleIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`

export function getTabContentAnimationSx(
  animation: TabContentAnimation,
  duration: number,
  direction: 'left' | 'right' | 'none'
): SxProps<Theme> {
  const timing = `${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`

  switch (animation) {
    case 'fade':
      return {
        animation: `${tabFadeIn} ${timing} both`
      }
    case 'slide-up':
      return {
        animation: `${tabSlideUp} ${timing} both`
      }
    case 'slide-horizontal':
      return {
        animation: `${direction === 'left' ? tabSlideFromLeft : tabSlideFromRight} ${timing} both`
      }
    case 'scale':
      return {
        animation: `${tabScaleIn} ${timing} both`
      }
    default:
      return {}
  }
}

export const TAB_ORIENTATION_OPTIONS = [
  { value: 'horizontal' as const, label: 'Horizontal', icon: 'ri-layout-top-line' },
  { value: 'vertical' as const, label: 'Vertical', icon: 'ri-layout-left-line' }
]

export const TAB_VARIANT_OPTIONS = [
  { value: 'underline' as const, label: 'Underline', icon: 'ri-subtract-line' },
  { value: 'pills' as const, label: 'Pills', icon: 'ri-capsule-line' },
  { value: 'segmented' as const, label: 'Segmented', icon: 'ri-toggle-line' },
  { value: 'bordered' as const, label: 'Bordered', icon: 'ri-checkbox-blank-line' },
  { value: 'elevated' as const, label: 'Elevated', icon: 'ri-shadow-line' }
]

export const TAB_CONTENT_ANIMATION_OPTIONS = [
  { value: 'none' as const, label: 'None', icon: 'ri-forbid-line' },
  { value: 'fade' as const, label: 'Fade', icon: 'ri-contrast-drop-2-line' },
  { value: 'slide-up' as const, label: 'Slide up', icon: 'ri-arrow-up-line' },
  { value: 'slide-horizontal' as const, label: 'Slide', icon: 'ri-arrow-left-right-line' },
  { value: 'scale' as const, label: 'Scale', icon: 'ri-zoom-in-line' }
]

export const TAB_BORDER_STYLE_OPTIONS = [
  { value: 'none' as const, label: 'None', icon: 'ri-checkbox-blank-line' },
  { value: 'subtle' as const, label: 'Subtle', icon: 'ri-square-line' },
  { value: 'outline' as const, label: 'Outline', icon: 'ri-checkbox-blank-line' },
  { value: 'elevated' as const, label: 'Card', icon: 'ri-layout-2-line' },
  { value: 'inset' as const, label: 'Inset', icon: 'ri-layout-bottom-line' }
]

export function tabVariantLabel(variant: TabVariant): string {
  return TAB_VARIANT_OPTIONS.find(option => option.value === variant)?.label ?? variant
}

export function tabOrientationLabel(orientation: TabOrientation): string {
  return TAB_ORIENTATION_OPTIONS.find(option => option.value === orientation)?.label ?? orientation
}
