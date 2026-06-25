export type IconPickerStyle = {
  color: string
  size: number
  showBackground: boolean
  backgroundColor: string
  borderRadius: number
}

export const DEFAULT_ICON_PICKER_STYLE: IconPickerStyle = {
  color: '#6366f1',
  size: 44,
  showBackground: false,
  backgroundColor: '#6366f1',
  borderRadius: 12
}

export const DEFAULT_LOGO_ICON_STYLE: IconPickerStyle = {
  color: '#6366f1',
  size: 28,
  showBackground: false,
  backgroundColor: '#6366f1',
  borderRadius: 10
}

export const DEFAULT_TAB_ICON_STYLE: Pick<IconPickerStyle, 'color' | 'size'> = {
  color: 'inherit',
  size: 16
}
