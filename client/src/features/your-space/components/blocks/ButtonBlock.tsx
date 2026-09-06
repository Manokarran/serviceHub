'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

import type { ButtonBlockProps } from '../../types'
import { InlineEditableText } from '../inline/InlineEditableText'
import { SitePageLink } from '../SitePageLink'
import { siteCanvasBelow } from '../../utils/siteResponsiveHelpers'
import { useSiteStyles } from '../SiteStylesScope'
import { getSiteButtonSx, mapBlockVariantToButtonRole } from '../../utils/siteStylesHelpers'
import { usePublicTenantSlug } from '../../hooks/usePublicTenantSlug'
import { isPublicSiteHost } from '@/lib/utils/tenant-host'

type Props = {
  props: ButtonBlockProps
}

export function ButtonBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const tenantSlug = usePublicTenantSlug()
  const role = mapBlockVariantToButtonRole(props.variant)
  const labelSx = { font: 'inherit', color: 'inherit' }

  if (!props.text?.trim()) {
    return null
  }

  const handleClick =
    props.action && props.action !== 'link'
      ? (event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault()

          const customEvent = new CustomEvent(
            props.action === 'serviceDirectory'
              ? 'servicehub:open-service-directory'
              : 'servicehub:open-service-booking',
            {
              cancelable: true,
              detail: { serviceSlug: props.serviceSlug }
            }
          )

          window.dispatchEvent(customEvent)

          if (
            !customEvent.defaultPrevented &&
            tenantSlug &&
            (window.location.pathname.startsWith('/site/') || isPublicSiteHost(window.location.host))
          ) {
            const bookingPath = isPublicSiteHost(window.location.host)
              ? '/book'
              : `/site/${encodeURIComponent(tenantSlug)}/book`

            const serviceQuery =
              props.action === 'serviceBooking' && props.serviceSlug?.trim()
                ? `?service=${encodeURIComponent(props.serviceSlug.trim())}`
                : ''

            window.location.assign(`${bookingPath}${serviceQuery}`)
          }
        }
      : undefined

  return (
    <Box
      sx={{
        px: 4,
        py: 2,
        display: 'flex',
        justifyContent:
          props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start',
        ...siteCanvasBelow({ px: 2, py: 1.5 })
      }}
    >
      <Button
        component={props.action && props.action !== 'link' ? 'button' : SitePageLink}
        href={props.link || '#'}
        onClick={handleClick}
        variant={props.variant}
        sx={getSiteButtonSx(role, siteStyles, props.color, props.borderRadius)}
      >
        <InlineEditableText value={props.text} field='text' placeholder='Button' sx={labelSx} />
      </Button>
    </Box>
  )
}
