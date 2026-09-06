import { Lora, Playfair_Display } from 'next/font/google'

/**
 * Shared register / launch-animation typefaces — same pairing as the Elegant site theme
 * (Playfair Display headings + Lora body).
 */
export const registerDisplayFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--register-display',
  display: 'swap'
})

export const registerBodyFont = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--register-body',
  display: 'swap'
})

export const registerFontVariablesClassName = `${registerDisplayFont.variable} ${registerBodyFont.variable}`
