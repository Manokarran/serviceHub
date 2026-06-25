'use client'

import { forwardRef } from 'react'
import type { AnchorHTMLAttributes, MouseEvent } from 'react'

import { useSitePageNavigation } from '../hooks/useSitePageNavigation'

type Props = AnchorHTMLAttributes<HTMLAnchorElement>

export const SitePageLink = forwardRef<HTMLAnchorElement, Props>(function SitePageLink(
  { href = '#', onClick, target, rel, style, ...rest },
  ref
) {
  const { handleLinkClick, resolveHref, isExternalHref, isCanvasEditing } = useSitePageNavigation()
  const resolvedHref = resolveHref(typeof href === 'string' ? href : undefined)
  const external = typeof resolvedHref === 'string' && isExternalHref(resolvedHref)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)

    if (!event.defaultPrevented) {
      handleLinkClick(event, typeof href === 'string' ? href : undefined)
    }
  }

  return (
    <a
      ref={ref}
      href={resolvedHref}
      onClick={handleClick}
      target={external ? '_blank' : target}
      rel={external ? 'noopener noreferrer' : rel}
      style={{
        cursor: isCanvasEditing ? 'default' : 'pointer',
        ...style
      }}
      {...rest}
    />
  )
})
