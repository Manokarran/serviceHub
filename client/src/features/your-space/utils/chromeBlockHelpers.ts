import type { BlockBackgroundProps, SplitVisualConfig } from '../types'
import {
  isEffectiveAnimatedBackgroundMode,
  isPhotoBackground,
  isVideoBackground
} from './sectionStyleHelpers'

export function chromeHasMediaBackground(props: BlockBackgroundProps): boolean {
  return isPhotoBackground(props) || isVideoBackground(props)
}

export function shouldRenderChromeBackgroundVisual(
  props: BlockBackgroundProps & SplitVisualConfig
): boolean {
  return isEffectiveAnimatedBackgroundMode(props)
}
