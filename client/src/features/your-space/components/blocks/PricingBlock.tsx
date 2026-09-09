'use client'

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import type {
  PricingBlockProps,
  PricingFeature,
  PricingFeatureIconStyle,
  PricingInterval,
  PricingPlan
} from '../../types'
import {
  getHeroPrimaryButtonSx,
  getHeroPrimaryButtonVariant,
  getHeroTitleGradientSx
} from '../../utils/heroBlockHelpers'
import {
  collectComparisonFeatures,
  ensurePricingPlans,
  findPlanFeature,
  formatPlanPrice,
  getPlanDiscountLabel,
  getPlanPrice,
  getPricingCardSurfaceSx,
  getYearlyTotal,
  isCustomPricedPlan,
  PRICING_MAX_WIDTH_MAP,
  resolvePricingPlanFill,
  updatePricingPlan
} from '../../utils/pricingBlockHelpers'
import { getHeroTitleFontSize, normalizeSiteFonts } from '../../utils/siteStylesHelpers'
import { siteCanvasAbove, siteCanvasBelow } from '../../utils/siteResponsiveHelpers'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useCanvasBlockEdit } from '../inline/CanvasBlockEditContext'
import { SitePageLink } from '../SitePageLink'
import { useSiteStyles } from '../SiteStylesScope'
import { ChromeBlockBackground } from './ChromeBlockBackground'

type Props = {
  props: PricingBlockProps
}

const PRICING_KEYFRAMES = {
  '@keyframes pricingFadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  '@keyframes pricingSlideUp': {
    from: { opacity: 0, transform: 'translateY(22px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  }
}

export function PricingBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const editContext = useCanvasBlockEdit()
  const plans = ensurePricingPlans(props.plans)
  const accent = props.accentColor?.trim() || siteStyles.colors.accent
  const textColor = props.textColor || siteStyles.colors.text
  const fonts = normalizeSiteFonts(siteStyles.fonts)
  const [interval, setInterval] = useState<PricingInterval>(props.defaultInterval)

  useEffect(() => {
    setInterval(props.defaultInterval)
  }, [props.defaultInterval])

  const updatePlan = (planId: string, changes: Partial<PricingPlan>) => {
    editContext?.updateProps({ plans: updatePricingPlan(plans, planId, changes) })
  }

  const selectInterval = (next: PricingInterval) => {
    setInterval(next)
    editContext?.updateProps({ defaultInterval: next })
  }

  const activeInterval = props.showIntervalToggle ? interval : props.defaultInterval
  const maxWidth = PRICING_MAX_WIDTH_MAP[props.maxWidth ?? 'lg']

  const alignItems =
    props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start'

  const titleSx = {
    fontFamily: siteStyles.fonts.headingFamily,
    fontWeight: siteStyles.fonts.headingWeight,
    letterSpacing: siteStyles.fonts.headingLetterSpacing,
    fontSize: {
      xs: Math.round(getHeroTitleFontSize(siteStyles.fonts, 'mobile') * 0.72),
      md: Math.round(getHeroTitleFontSize(siteStyles.fonts, 'desktop') * 0.78)
    },
    lineHeight: 1.12,
    color: textColor,
    textAlign: props.alignment,
    m: 0,
    ...getHeroTitleGradientSx(props.titleStyle, textColor, accent)
  }

  return (
    <ChromeBlockBackground
      props={props}
      fallbackColor='#ffffff'
      component='section'
      sx={{
        ...PRICING_KEYFRAMES,
        py: `${props.paddingY}px`,
        px: `${props.paddingX}px`,
        color: textColor,
        ...siteCanvasBelow({
          ...(props.paddingX > 24 ? { px: `${Math.min(props.paddingX, 24)}px` } : {})
        })
      }}
      contentSx={{
        width: '100%',
        maxWidth,
        mx: props.maxWidth === 'full' ? 0 : 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems,
        gap: 3
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 720, textAlign: props.alignment }}>
        {Boolean(props.eyebrow?.trim()) && (
          <Typography
            sx={{
              fontFamily: siteStyles.fonts.bodyFamily,
              fontSize: Math.round(fonts.bodySize * 0.78),
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: accent,
              mb: 1
            }}
          >
            <InlineEditableText
              value={props.eyebrow}
              placeholder='Eyebrow'
              onCommit={eyebrow => editContext?.updateProps({ eyebrow })}
            />
          </Typography>
        )}
        <Typography variant='h2' sx={titleSx}>
          <InlineEditableText
            value={props.title}
            placeholder='Pricing title'
            onCommit={title => editContext?.updateProps({ title })}
            sx={titleSx}
          />
        </Typography>
        {Boolean(props.subtitle?.trim()) && (
          <Typography
            sx={{
              mt: 1.5,
              fontFamily: siteStyles.fonts.bodyFamily,
              fontSize: { xs: fonts.bodySize, md: Math.round(fonts.bodySize * 1.05) },
              lineHeight: 1.7,
              color: textColor,
              opacity: 0.74
            }}
          >
            <InlineEditableText
              value={props.subtitle}
              placeholder='Supporting copy'
              multiline
              onCommit={subtitle => editContext?.updateProps({ subtitle })}
            />
          </Typography>
        )}
      </Box>

      {props.showIntervalToggle && (
        <IntervalToggle
          interval={activeInterval}
          monthlyLabel={props.monthlyLabel}
          annualLabel={props.annualLabel}
          annualBadge={props.annualBadge}
          accent={accent}
          textColor={textColor}
          onChange={selectInterval}
        />
      )}

      {props.layout === 'comparison' ? (
        <>
          <Box
            sx={{
              width: '100%',
              display: 'none',
              ...siteCanvasAbove({ display: 'block' })
            }}
          >
            <ComparisonTable
              props={props}
              plans={plans}
              interval={activeInterval}
              accent={accent}
              textColor={textColor}
              onUpdatePlan={updatePlan}
            />
          </Box>
          <Box
            sx={{
              width: '100%',
              display: 'grid',
              gap: `${props.gap}px`,
              alignItems: 'stretch',
              gridTemplateColumns: '1fr',
              ...siteCanvasAbove({ display: 'none' })
            }}
          >
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                index={index}
                props={props}
                interval={activeInterval}
                accent={accent}
                textColor={textColor}
                onUpdatePlan={updatePlan}
              />
            ))}
          </Box>
        </>
      ) : (
        <Box
          sx={{
            width: '100%',
            display: 'grid',
            gap: `${props.gap}px`,
            alignItems: 'stretch',
            gridTemplateColumns: {
              xs: '1fr',
              md: props.layout === 'stack' ? '1fr' : `repeat(${Math.min(props.columns, plans.length)}, minmax(0, 1fr))`
            },
            ...siteCanvasBelow({ gridTemplateColumns: '1fr' }),
            ...siteCanvasAbove({
              gridTemplateColumns:
                props.layout === 'stack' ? '1fr' : `repeat(${Math.min(props.columns, plans.length)}, minmax(0, 1fr))`
            })
          }}
        >
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={index}
              props={props}
              interval={activeInterval}
              accent={accent}
              textColor={textColor}
              onUpdatePlan={updatePlan}
            />
          ))}
        </Box>
      )}
    </ChromeBlockBackground>
  )
}

function IntervalToggle({
  interval,
  monthlyLabel,
  annualLabel,
  annualBadge,
  accent,
  textColor,
  onChange
}: {
  interval: PricingInterval
  monthlyLabel: string
  annualLabel: string
  annualBadge: string
  accent: string
  textColor: string
  onChange: (interval: PricingInterval) => void
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', justifyContent: 'center' }}>
      <Box
        sx={{
          display: 'inline-flex',
          p: 0.5,
          borderRadius: 999,
          border: '1px solid',
          borderColor: alpha(textColor, 0.12),
          backgroundColor: alpha(textColor, 0.04)
        }}
      >
        {(['monthly', 'annual'] as const).map(value => {
          const active = interval === value

          return (
            <Box
              key={value}
              component='button'
              type='button'
              onClick={() => onChange(value)}
              sx={{
                border: 'none',
                cursor: 'pointer',
                px: 2,
                py: 0.75,
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13,
                color: active ? '#ffffff' : alpha(textColor, 0.7),
                backgroundColor: active ? accent : 'transparent',
                boxShadow: active ? `0 8px 18px ${alpha(accent, 0.28)}` : 'none'
              }}
            >
              {value === 'monthly' ? monthlyLabel : annualLabel}
            </Box>
          )
        })}
      </Box>
      {Boolean(annualBadge?.trim()) && (
        <Box
          sx={{
            px: 1.25,
            py: 0.4,
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            color: accent,
            backgroundColor: alpha(accent, 0.12)
          }}
        >
          {annualBadge}
        </Box>
      )}
    </Box>
  )
}

function PlanCard({
  plan,
  index,
  props,
  interval,
  accent,
  textColor,
  onUpdatePlan
}: {
  plan: PricingPlan
  index: number
  props: PricingBlockProps
  interval: PricingInterval
  accent: string
  textColor: string
  onUpdatePlan: (planId: string, changes: Partial<PricingPlan>) => void
}) {
  const siteStyles = useSiteStyles()
  const planAccent = plan.accentColor?.trim() || accent
  const featured = plan.recommended
  const custom = isCustomPricedPlan(plan)
  const price = getPlanPrice(plan, interval)
  const discount = getPlanDiscountLabel(plan, interval)

  const surface = getPricingCardSurfaceSx({
    cardStyle: props.cardStyle,
    fill: resolvePricingPlanFill(props, plan),
    accent: planAccent,
    textColor,
    featured,
    borderColor: props.cardBorderColor,
    borderWidth: props.cardBorderWidth ?? 1,
    shadow: props.cardShadow ?? 'medium'
  })

  const hoverSx =
    props.hoverEffect === 'lift'
      ? { transform: 'translateY(-8px)', boxShadow: `0 22px 48px ${alpha(planAccent, 0.18)}` }
      : props.hoverEffect === 'glow'
        ? { boxShadow: `0 0 0 1px ${alpha(planAccent, 0.45)}, 0 20px 44px ${alpha(planAccent, 0.28)}` }
        : {}

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: { xs: 2.5, md: 3 },
        borderRadius: `${props.cardRadius}px`,
        ...surface,
        transform: featured && props.recommendedScale ? 'scale(1.03)' : 'none',
        zIndex: featured ? 2 : 1,
        transition: 'transform 0.28s ease, box-shadow 0.28s ease',
        animation: getEntranceAnimation(props.entranceAnimation, index),
        ...(featured && props.recommendedGlow
          ? {
              boxShadow: [surface.boxShadow, `0 0 0 1px ${alpha(planAccent, 0.5)}`, `0 24px 50px ${alpha(planAccent, 0.22)}`]
                .filter(value => value && value !== 'none')
                .join(', ')
            }
          : {}),
        '&:hover': hoverSx
      }}
    >
      {(plan.badge || featured) && (
        <Box
          sx={{
            alignSelf: 'flex-start',
            px: 1.25,
            py: 0.4,
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: featured ? '#ffffff' : planAccent,
            backgroundColor: featured ? planAccent : alpha(planAccent, 0.12)
          }}
        >
          <InlineEditableText
            value={plan.badge || 'Recommended'}
            placeholder='Badge'
            onCommit={badge => onUpdatePlan(plan.id, { badge })}
          />
        </Box>
      )}
      <Typography sx={{ fontWeight: 800, fontSize: 22, color: textColor }}>
        <InlineEditableText value={plan.name} placeholder='Plan name' onCommit={name => onUpdatePlan(plan.id, { name })} />
      </Typography>
      <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: textColor, opacity: 0.72 }}>
        <InlineEditableText
          value={plan.description}
          placeholder='Short description'
          multiline
          onCommit={description => onUpdatePlan(plan.id, { description })}
        />
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: { xs: 36, md: 42 }, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {custom ? plan.customPriceLabel : formatPlanPrice(price, plan.currency || props.currency)}
        </Typography>
        {!custom && <Typography sx={{ pb: 0.75, opacity: 0.6, fontWeight: 600 }}>/ month</Typography>}
        {Boolean(discount) && (
          <Box sx={{ pb: 0.85, fontSize: 12, fontWeight: 800, color: planAccent }}>
            {discount}
          </Box>
        )}
      </Box>
      {!custom && interval === 'annual' && props.showYearlyTotal && (
        <Typography sx={{ fontSize: 13, opacity: 0.62 }}>
          Billed {formatPlanPrice(getYearlyTotal(plan), plan.currency || props.currency)} yearly
        </Typography>
      )}
      <Button
        component={SitePageLink}
        href={plan.ctaLink || '#'}
        variant={getHeroPrimaryButtonVariant(props.buttonStyle, siteStyles)}
        sx={{
          ...getHeroPrimaryButtonSx(
            props.buttonStyle,
            siteStyles,
            featured ? planAccent : siteStyles.colors.accent,
            textColor
          ),
          mt: 0.5
        }}
      >
        <InlineEditableText
          value={plan.ctaText}
          placeholder='Call to action'
          onCommit={ctaText => onUpdatePlan(plan.id, { ctaText })}
        />
      </Button>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
        {plan.features.map(feature => (
          <FeatureRow
            key={feature.id}
            feature={feature}
            iconStyle={props.featureIconStyle}
            accent={planAccent}
            textColor={textColor}
          />
        ))}
      </Box>
    </Box>
  )
}

function ComparisonTable({
  props,
  plans,
  interval,
  accent,
  textColor,
  onUpdatePlan
}: {
  props: PricingBlockProps
  plans: PricingPlan[]
  interval: PricingInterval
  accent: string
  textColor: string
  onUpdatePlan: (planId: string, changes: Partial<PricingPlan>) => void
}) {
  const siteStyles = useSiteStyles()
  const rows = useMemo(() => collectComparisonFeatures(plans), [plans])
  const radius = `${props.cardRadius}px`

  const planColumnSx = (plan: PricingPlan, edge: 'header' | 'body' | 'footer' | 'solo') => {
    const planAccent = plan.accentColor?.trim() || accent

    const surface = getPricingCardSurfaceSx({
      cardStyle: props.cardStyle,
      fill: resolvePricingPlanFill(props, plan),
      accent: planAccent,
      textColor,
      featured: plan.recommended,
      borderColor: props.cardBorderColor,
      borderWidth: props.cardBorderWidth ?? 1,
      shadow: props.cardShadow ?? 'medium'
    })

    return {
      backgroundColor: surface.backgroundColor,
      backgroundImage: surface.backgroundImage,
      backdropFilter: surface.backdropFilter,
      borderLeft: surface.border,
      borderRight: surface.border,
      borderTop: edge === 'header' || edge === 'solo' ? surface.border : `1px solid ${alpha(textColor, 0.08)}`,
      borderBottom: edge === 'footer' || edge === 'solo' ? surface.border : 'none',
      borderTopLeftRadius: edge === 'header' || edge === 'solo' ? radius : 0,
      borderTopRightRadius: edge === 'header' || edge === 'solo' ? radius : 0,
      borderBottomLeftRadius: edge === 'footer' || edge === 'solo' ? radius : 0,
      borderBottomRightRadius: edge === 'footer' || edge === 'solo' ? radius : 0,
      boxShadow: edge === 'header' || edge === 'solo' ? surface.boxShadow : 'none'
    }
  }

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          minWidth: 640,
          columnGap: `${props.gap}px`,
          gridTemplateColumns: `minmax(180px, 1.2fr) repeat(${plans.length}, minmax(160px, 1fr))`
        }}
      >
        <Box sx={{ p: 2.5 }} />
        {plans.map(plan => {
          const planAccent = plan.accentColor?.trim() || accent
          const custom = isCustomPricedPlan(plan)
          const edge = rows.length === 0 ? 'solo' : 'header'

          return (
            <Box
              key={plan.id}
              sx={{
                p: 2.5,
                textAlign: 'center',
                ...planColumnSx(plan, edge)
              }}
            >
              <Typography sx={{ fontWeight: 800, mb: 0.75 }}>
                <InlineEditableText value={plan.name} placeholder='Plan' onCommit={name => onUpdatePlan(plan.id, { name })} />
              </Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>
                {custom
                  ? plan.customPriceLabel
                  : formatPlanPrice(getPlanPrice(plan, interval), plan.currency || props.currency)}
              </Typography>
              <Button
                component={SitePageLink}
                href={plan.ctaLink || '#'}
                variant={getHeroPrimaryButtonVariant(props.buttonStyle, siteStyles)}
                size='small'
                sx={{
                  ...getHeroPrimaryButtonSx(props.buttonStyle, siteStyles, planAccent, textColor),
                  mt: 1.5
                }}
              >
                {plan.ctaText}
              </Button>
            </Box>
          )
        })}
        {rows.map((row, index) => (
          <Box key={row} sx={{ display: 'contents' }}>
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                fontSize: 14,
                fontWeight: 600,
                borderTop: `1px solid ${alpha(textColor, 0.08)}`
              }}
            >
              {row}
            </Box>
            {plans.map(plan => {
              const feature = findPlanFeature(plan, row)
              const planAccent = plan.accentColor?.trim() || accent
              const edge = rows.length === 1 ? 'footer' : index === rows.length - 1 ? 'footer' : 'body'

              return (
                <Box
                  key={`${plan.id}-${row}`}
                  sx={{
                    px: 2,
                    py: 1.5,
                    textAlign: 'center',
                    ...planColumnSx(plan, edge)
                  }}
                >
                  <FeatureMark
                    feature={feature}
                    iconStyle={props.featureIconStyle}
                    accent={planAccent}
                    textColor={textColor}
                  />
                </Box>
              )
            })}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function FeatureRow({
  feature,
  iconStyle,
  accent,
  textColor
}: {
  feature: PricingFeature
  iconStyle: PricingFeatureIconStyle
  accent: string
  textColor: string
}) {
  const excluded = feature.state === 'excluded'

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, opacity: excluded ? 0.45 : 1 }}>
      <FeatureMark feature={feature} iconStyle={iconStyle} accent={accent} textColor={textColor} />
      <Box>
        <Typography sx={{ fontSize: 14, lineHeight: 1.45, textDecoration: excluded ? 'line-through' : 'none' }}>
          {feature.text}
        </Typography>
        {feature.state === 'limited' && Boolean(feature.hint?.trim()) && (
          <Typography sx={{ fontSize: 12, opacity: 0.65 }}>{feature.hint}</Typography>
        )}
      </Box>
    </Box>
  )
}

function FeatureMark({
  feature,
  iconStyle,
  accent,
  textColor
}: {
  feature?: PricingFeature
  iconStyle: PricingFeatureIconStyle
  accent: string
  textColor: string
}) {
  if (iconStyle === 'none') {
    return null
  }

  const state = feature?.state ?? 'excluded'

  const icon =
    state === 'included'
      ? iconStyle === 'dot'
        ? 'ri-circle-fill'
        : 'ri-check-line'
      : state === 'limited'
        ? 'ri-subtract-line'
        : 'ri-close-line'

  return (
    <Box
      component='i'
      className={icon}
      sx={{
        color: state === 'included' ? accent : alpha(textColor, 0.45),
        fontSize: iconStyle === 'dot' ? 8 : 16,
        mt: iconStyle === 'dot' ? 0.7 : 0.15,
        flexShrink: 0
      }}
    />
  )
}

function getEntranceAnimation(kind: PricingBlockProps['entranceAnimation'], index: number) {
  if (kind === 'none') {
    return 'none'
  }

  const name = kind === 'fade-in' ? 'pricingFadeIn' : 'pricingSlideUp'

  return `${name} 0.55s ease ${index * 0.08}s both`
}
