'use client'

import { alpha, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'

interface Colors {
  accent: string
  strong: string
  mid: string
  faint: string
  frame: string
  panelBg: string
}

type Renderer = (c: Colors) => React.ReactNode

const THUMBNAILS: Record<string, Renderer> = {
  /* ─── Layout: Sections ─────────────────────────────────────────── */
  'section-single': ({ strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="3" width="74" height="42" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="10" y="11" width="38" height="5" rx="2.5" fill={strong} />
      <rect x="10" y="21" width="60" height="3" rx="1.5" fill={mid} />
      <rect x="10" y="27" width="52" height="3" rx="1.5" fill={mid} />
      <rect x="10" y="33" width="56" height="3" rx="1.5" fill={mid} />
    </>
  ),

  'section-double': ({ strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="3" width="35" height="42" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="9" y="11" width="22" height="4" rx="2" fill={strong} />
      <rect x="9" y="19" width="26" height="2.5" rx="1.5" fill={mid} />
      <rect x="9" y="24" width="20" height="2.5" rx="1.5" fill={mid} />
      <rect x="9" y="29" width="23" height="2.5" rx="1.5" fill={mid} />
      <rect x="42" y="3" width="35" height="42" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="48" y="11" width="22" height="4" rx="2" fill={strong} />
      <rect x="48" y="19" width="26" height="2.5" rx="1.5" fill={mid} />
      <rect x="48" y="24" width="20" height="2.5" rx="1.5" fill={mid} />
      <rect x="48" y="29" width="23" height="2.5" rx="1.5" fill={mid} />
    </>
  ),

  'section-stacked': ({ strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="3" width="74" height="19" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="10" y="8" width="32" height="4" rx="2" fill={strong} />
      <rect x="10" y="15" width="52" height="2.5" rx="1.5" fill={mid} />
      <rect x="3" y="26" width="74" height="19" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="10" y="31" width="32" height="4" rx="2" fill={strong} />
      <rect x="10" y="38" width="52" height="2.5" rx="1.5" fill={mid} />
    </>
  ),

  /* ─── Layout: Carousels ─────────────────────────────────────────── */
  'carousel-slide': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="3" width="74" height="38" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <polygon points="11,22 17,16 17,28" fill={mid} />
      <polygon points="69,22 63,16 63,28" fill={mid} />
      <rect x="22" y="14" width="36" height="5" rx="2.5" fill={strong} />
      <rect x="26" y="23" width="28" height="3" rx="1.5" fill={mid} />
      <circle cx="34" cy="45" r="2.5" fill={accent} />
      <circle cx="40" cy="45" r="2" fill={mid} />
      <circle cx="46" cy="45" r="2" fill={mid} />
    </>
  ),

  'carousel-fade': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="3" width="74" height="38" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="7" y="7" width="66" height="28" rx="3" fill={mid} opacity="0.35" />
      <rect x="19" y="13" width="42" height="5" rx="2.5" fill={strong} />
      <rect x="25" y="22" width="30" height="3" rx="1.5" fill={mid} />
      <circle cx="34" cy="45" r="2.5" fill={accent} />
      <circle cx="40" cy="45" r="2" fill={mid} />
      <circle cx="46" cy="45" r="2" fill={mid} />
    </>
  ),

  'carousel-cards': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="9" width="27" height="30" rx="3" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="13" y="5" width="34" height="34" rx="3" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="50" y="9" width="27" height="30" rx="3" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="20" y="14" width="20" height="4" rx="2" fill={strong} />
      <rect x="20" y="21" width="20" height="2.5" rx="1.5" fill={mid} />
      <rect x="20" y="26" width="16" height="2.5" rx="1.5" fill={mid} />
      <circle cx="34" cy="45" r="2.5" fill={accent} />
      <circle cx="40" cy="45" r="2" fill={mid} />
    </>
  ),

  'carousel-coverflow': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="11" width="18" height="26" rx="3" fill={faint} stroke={frame} strokeWidth="0.8" opacity="0.7" />
      <rect x="59" y="11" width="18" height="26" rx="3" fill={faint} stroke={frame} strokeWidth="0.8" opacity="0.7" />
      <rect x="17" y="5" width="46" height="36" rx="4" fill={faint} stroke={accent} strokeWidth="0.8" />
      <rect x="25" y="14" width="30" height="5" rx="2.5" fill={strong} />
      <rect x="27" y="23" width="26" height="3" rx="1.5" fill={mid} />
      <rect x="29" y="29" width="22" height="2.5" rx="1.5" fill={mid} />
      <circle cx="34" cy="45" r="2.5" fill={accent} />
      <circle cx="40" cy="45" r="2" fill={mid} />
      <circle cx="46" cy="45" r="2" fill={mid} />
    </>
  ),

  /* ─── Layout: Tabs ─────────────────────────────────────────────── */
  'tabs-horizontal-underline': ({ accent, strong, mid, faint, frame }) => (
    <>
      {/* Tab buttons */}
      <rect x="3" y="3" width="20" height="11" rx="0" fill="transparent" />
      <rect x="3" y="13" width="20" height="2" rx="1" fill={accent} />
      <rect x="25" y="3" width="20" height="11" rx="0" fill="transparent" />
      <rect x="47" y="3" width="20" height="11" rx="0" fill="transparent" />
      {/* Tab labels */}
      <rect x="5" y="7" width="16" height="3" rx="1.5" fill={strong} />
      <rect x="27" y="7" width="16" height="3" rx="1.5" fill={mid} />
      <rect x="49" y="7" width="16" height="3" rx="1.5" fill={mid} />
      {/* Full-width baseline */}
      <line x1="3" y1="15.5" x2="77" y2="15.5" stroke={frame} strokeWidth="0.8" />
      {/* Content */}
      <rect x="3" y="19" width="74" height="29" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="10" y="26" width="36" height="4" rx="2" fill={strong} />
      <rect x="10" y="34" width="52" height="2.5" rx="1.5" fill={mid} />
      <rect x="10" y="39" width="42" height="2.5" rx="1.5" fill={mid} />
    </>
  ),

  'tabs-horizontal-pills': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="3" width="22" height="11" rx="5.5" fill={alpha(accent, 0.18)} stroke={alpha(accent, 0.3)} strokeWidth="0.8" />
      <rect x="28" y="3" width="22" height="11" rx="5.5" fill={faint} />
      <rect x="53" y="3" width="22" height="11" rx="5.5" fill={faint} />
      <rect x="6" y="7" width="16" height="3" rx="1.5" fill={accent} />
      <rect x="31" y="7" width="16" height="3" rx="1.5" fill={mid} />
      <rect x="56" y="7" width="16" height="3" rx="1.5" fill={mid} />
      <rect x="3" y="18" width="74" height="30" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="10" y="25" width="36" height="4" rx="2" fill={strong} />
      <rect x="10" y="33" width="52" height="2.5" rx="1.5" fill={mid} />
      <rect x="10" y="38.5" width="42" height="2.5" rx="1.5" fill={mid} />
    </>
  ),

  'tabs-horizontal-segmented': ({ accent, strong, mid, faint, frame }) => (
    <>
      {/* Segmented track */}
      <rect x="3" y="3" width="74" height="13" rx="4" fill={mid} opacity="0.45" stroke={frame} strokeWidth="0.8" />
      {/* Active segment */}
      <rect x="4.5" y="4.5" width="23" height="10" rx="3" fill="white" />
      <line x1="28" y1="5" x2="28" y2="15" stroke={frame} strokeWidth="0.8" />
      <line x1="54" y1="5" x2="54" y2="15" stroke={frame} strokeWidth="0.8" />
      <rect x="7" y="8" width="17" height="3" rx="1.5" fill={strong} />
      <rect x="33" y="8" width="17" height="3" rx="1.5" fill={mid} />
      <rect x="59" y="8" width="17" height="3" rx="1.5" fill={mid} />
      {/* Content */}
      <rect x="3" y="20" width="74" height="28" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="10" y="27" width="36" height="4" rx="2" fill={strong} />
      <rect x="10" y="35" width="52" height="2.5" rx="1.5" fill={mid} />
      <rect x="10" y="40" width="40" height="2.5" rx="1.5" fill={mid} />
    </>
  ),

  'tabs-vertical-sidebar': ({ accent, strong, mid, faint, frame }) => (
    <>
      {/* Left sidebar */}
      <rect x="3" y="3" width="23" height="42" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      {/* Active indicator */}
      <rect x="3" y="7" width="3" height="11" rx="1.5" fill={accent} />
      <rect x="8" y="8" width="13" height="9" rx="3" fill={alpha(accent, 0.12)} />
      <rect x="10" y="10.5" width="9" height="4" rx="2" fill={strong} />
      <rect x="8" y="22" width="13" height="9" rx="3" fill="transparent" />
      <rect x="10" y="24.5" width="9" height="4" rx="2" fill={mid} />
      <rect x="8" y="35" width="13" height="9" rx="3" fill="transparent" />
      <rect x="10" y="37.5" width="9" height="4" rx="2" fill={mid} />
      {/* Content area */}
      <rect x="30" y="3" width="47" height="42" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="36" y="11" width="28" height="4" rx="2" fill={strong} />
      <rect x="36" y="19" width="34" height="2.5" rx="1.5" fill={mid} />
      <rect x="36" y="24.5" width="28" height="2.5" rx="1.5" fill={mid} />
      <rect x="36" y="30" width="31" height="2.5" rx="1.5" fill={mid} />
    </>
  ),

  'tabs-vertical-elevated': ({ accent, strong, mid, faint, frame }) => (
    <>
      {/* Active elevated tab */}
      <rect x="3" y="3" width="23" height="13" rx="3" fill="white" stroke={alpha(accent, 0.3)} strokeWidth="0.8" />
      <rect x="7" y="8" width="15" height="3" rx="1.5" fill={strong} />
      {/* Inactive tabs */}
      <rect x="3" y="20" width="23" height="11" rx="3" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="7" y="24" width="15" height="3" rx="1.5" fill={mid} />
      <rect x="3" y="35" width="23" height="11" rx="3" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="7" y="39" width="15" height="3" rx="1.5" fill={mid} />
      {/* Content */}
      <rect x="30" y="3" width="47" height="43" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="36" y="12" width="28" height="4" rx="2" fill={strong} />
      <rect x="36" y="20" width="34" height="2.5" rx="1.5" fill={mid} />
      <rect x="36" y="25.5" width="26" height="2.5" rx="1.5" fill={mid} />
      <rect x="36" y="31" width="30" height="2.5" rx="1.5" fill={mid} />
    </>
  ),

  /* ─── Sections ──────────────────────────────────────────────────── */
  'header': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="3" width="74" height="18" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <circle cx="13" cy="12" r="5" fill={alpha(accent, 0.22)} stroke={alpha(accent, 0.4)} strokeWidth="0.8" />
      <rect x="38" y="9.5" width="10" height="3" rx="1.5" fill={mid} />
      <rect x="52" y="9.5" width="10" height="3" rx="1.5" fill={mid} />
      <rect x="66" y="8.5" width="9" height="5" rx="2.5" fill={alpha(accent, 0.22)} stroke={alpha(accent, 0.35)} strokeWidth="0.8" />
      <rect x="3" y="25" width="74" height="23" rx="4" fill={faint} opacity="0.55" />
      <rect x="20" y="30" width="40" height="4" rx="2" fill={strong} opacity="0.35" />
      <rect x="26" y="37" width="28" height="3" rx="1.5" fill={mid} opacity="0.35" />
    </>
  ),

  'footer': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="3" width="74" height="22" rx="4" fill={faint} opacity="0.5" />
      <rect x="20" y="9" width="40" height="4" rx="2" fill={strong} opacity="0.3" />
      <rect x="26" y="16" width="28" height="3" rx="1.5" fill={mid} opacity="0.3" />
      <rect x="3" y="29" width="74" height="19" rx="4" fill={alpha(strong, 0.18)} stroke={frame} strokeWidth="0.8" />
      <circle cx="12" cy="38.5" r="5" fill={alpha(accent, 0.28)} />
      <rect x="40" y="36" width="9" height="2.5" rx="1.5" fill={mid} />
      <rect x="53" y="36" width="9" height="2.5" rx="1.5" fill={mid} />
      <rect x="66" y="36" width="9" height="2.5" rx="1.5" fill={mid} />
      <rect x="12" y="42.5" width="36" height="1.5" rx="1" fill={mid} opacity="0.5" />
    </>
  ),

  'hero': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="3" width="74" height="42" rx="4" fill={alpha(accent, 0.09)} stroke={alpha(accent, 0.18)} strokeWidth="0.8" />
      <rect x="17" y="11" width="46" height="6" rx="3" fill={strong} />
      <rect x="22" y="21" width="36" height="3" rx="1.5" fill={mid} />
      <rect x="27" y="27" width="26" height="3" rx="1.5" fill={mid} />
      <rect x="27" y="34" width="26" height="8" rx="4" fill={alpha(accent, 0.28)} stroke={alpha(accent, 0.45)} strokeWidth="0.8" />
      <rect x="30" y="37" width="20" height="2.5" rx="1.5" fill={accent} opacity="0.65" />
    </>
  ),

  'showcase-split': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="3" width="34" height="42" rx="4" fill={alpha(accent, 0.12)} stroke={alpha(accent, 0.22)} strokeWidth="0.8" />
      <circle cx="20" cy="16" r="5" fill={alpha(accent, 0.35)} />
      <rect x="42" y="10" width="16" height="3" rx="1.5" fill={mid} />
      <rect x="42" y="17" width="32" height="5" rx="2.5" fill={strong} />
      <rect x="42" y="26" width="30" height="2.5" rx="1.25" fill={mid} />
      <rect x="42" y="31" width="24" height="2.5" rx="1.25" fill={mid} />
      <rect x="42" y="37" width="18" height="5" rx="2.5" fill={alpha(accent, 0.28)} />
    </>
  ),

  'showcase-stack': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="3" width="74" height="42" rx="4" fill={alpha(accent, 0.1)} stroke={alpha(accent, 0.2)} strokeWidth="0.8" />
      <rect x="10" y="8" width="18" height="4" rx="2" fill={strong} />
      <rect x="10" y="28" width="36" height="5" rx="2.5" fill={strong} />
      <rect x="10" y="36" width="48" height="3" rx="1.5" fill={mid} />
    </>
  ),

  'showcase-cards': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="6" width="22" height="36" rx="3" fill={alpha(accent, 0.1)} stroke={frame} strokeWidth="0.8" />
      <rect x="29" y="6" width="22" height="36" rx="3" fill={alpha(accent, 0.1)} stroke={frame} strokeWidth="0.8" />
      <rect x="55" y="6" width="22" height="36" rx="3" fill={alpha(accent, 0.1)} stroke={frame} strokeWidth="0.8" />
      <rect x="7" y="10" width="10" height="2.5" rx="1.25" fill={strong} />
      <rect x="33" y="10" width="10" height="2.5" rx="1.25" fill={strong} />
      <rect x="59" y="10" width="10" height="2.5" rx="1.25" fill={strong} />
      <rect x="7" y="32" width="14" height="3" rx="1.5" fill={mid} />
      <rect x="33" y="32" width="14" height="3" rx="1.5" fill={mid} />
      <rect x="59" y="32" width="14" height="3" rx="1.5" fill={mid} />
    </>
  ),

  'pricing-cards': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="4" y="8" width="22" height="34" rx="3" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="29" y="4" width="22" height="40" rx="3" fill={alpha(accent, 0.14)} stroke={alpha(accent, 0.45)} strokeWidth="1" />
      <rect x="54" y="8" width="22" height="34" rx="3" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="8" y="12" width="14" height="3" rx="1.5" fill={strong} />
      <rect x="33" y="8" width="14" height="3" rx="1.5" fill={accent} />
      <rect x="58" y="12" width="14" height="3" rx="1.5" fill={strong} />
      <rect x="8" y="18" width="10" height="6" rx="1.5" fill={mid} />
      <rect x="33" y="14" width="12" height="8" rx="1.5" fill={strong} />
      <rect x="58" y="18" width="10" height="6" rx="1.5" fill={mid} />
      <rect x="33" y="36" width="14" height="4" rx="2" fill={accent} />
    </>
  ),

  'pricing-comparison': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="3" y="6" width="74" height="36" rx="3" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="6" y="10" width="16" height="3" rx="1.5" fill={mid} />
      <rect x="28" y="9" width="12" height="4" rx="2" fill={strong} />
      <rect x="46" y="9" width="12" height="4" rx="2" fill={accent} />
      <rect x="64" y="9" width="10" height="4" rx="2" fill={strong} />
      <rect x="6" y="18" width="68" height="1" fill={frame} />
      <rect x="6" y="23" width="16" height="2" rx="1" fill={mid} />
      <circle cx="34" cy="24" r="2" fill={accent} />
      <circle cx="52" cy="24" r="2" fill={accent} />
      <circle cx="69" cy="24" r="2" fill={mid} />
      <rect x="6" y="31" width="16" height="2" rx="1" fill={mid} />
      <circle cx="34" cy="32" r="2" fill={accent} />
      <circle cx="52" cy="32" r="2" fill={accent} />
      <circle cx="69" cy="32" r="2" fill={accent} />
    </>
  ),

  'pricing-simple': ({ accent, strong, mid, faint, frame }) => (
    <>
      <rect x="6" y="5" width="68" height="18" rx="3" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="12" y="9" width="20" height="3" rx="1.5" fill={strong} />
      <rect x="50" y="8" width="16" height="10" rx="2" fill={alpha(accent, 0.28)} />
      <rect x="6" y="27" width="68" height="18" rx="3" fill={alpha(accent, 0.1)} stroke={alpha(accent, 0.35)} strokeWidth="0.8" />
      <rect x="12" y="31" width="20" height="3" rx="1.5" fill={accent} />
      <rect x="50" y="30" width="16" height="10" rx="2" fill={accent} />
    </>
  ),

  /* ─── Typography ────────────────────────────────────────────────── */
  'heading': ({ strong, mid }) => (
    <>
      <rect x="8" y="8" width="58" height="8" rx="4" fill={strong} />
      <rect x="8" y="21" width="46" height="6" rx="3" fill={strong} opacity="0.65" />
      <rect x="8" y="33" width="36" height="4" rx="2" fill={mid} opacity="0.55" />
    </>
  ),

  'heading-display': ({ strong }) => (
    <>
      <rect x="6" y="10" width="68" height="12" rx="4" fill={strong} />
      <rect x="14" y="28" width="52" height="8" rx="3" fill={strong} opacity="0.7" />
    </>
  ),

  'heading-eyebrow': ({ mid, strong }) => (
    <>
      <rect x="18" y="12" width="44" height="4" rx="2" fill={mid} />
      <rect x="10" y="24" width="60" height="8" rx="3" fill={strong} />
    </>
  ),

  'heading-script': ({ accent, strong }) => (
    <>
      <path
        d="M12 30 C22 12, 38 12, 48 26 C56 36, 66 34, 70 24"
        fill="none"
        stroke={accent}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <rect x="20" y="36" width="40" height="3" rx="1.5" fill={strong} opacity="0.35" />
    </>
  ),

  'text': ({ mid }) => (
    <>
      <rect x="8" y="7" width="64" height="3" rx="1.5" fill={mid} />
      <rect x="8" y="14" width="58" height="3" rx="1.5" fill={mid} />
      <rect x="8" y="21" width="62" height="3" rx="1.5" fill={mid} />
      <rect x="8" y="28" width="52" height="3" rx="1.5" fill={mid} />
      <rect x="8" y="35" width="46" height="3" rx="1.5" fill={mid} />
    </>
  ),

  'text-lead': ({ strong, mid }) => (
    <>
      <rect x="8" y="10" width="64" height="5" rx="2.5" fill={strong} opacity="0.75" />
      <rect x="8" y="20" width="58" height="4" rx="2" fill={mid} />
      <rect x="8" y="29" width="50" height="4" rx="2" fill={mid} />
    </>
  ),

  'text-quote': ({ accent, mid, faint, frame }) => (
    <>
      <rect x="6" y="6" width="68" height="36" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="10" y="10" width="3" height="28" rx="1.5" fill={accent} />
      <rect x="18" y="14" width="48" height="3" rx="1.5" fill={mid} />
      <rect x="18" y="21" width="42" height="3" rx="1.5" fill={mid} />
      <rect x="18" y="28" width="36" height="3" rx="1.5" fill={mid} />
    </>
  ),

  'text-pullquote': ({ accent, strong }) => (
    <>
      <text x="12" y="22" fontSize="22" fill={accent} opacity="0.45" fontFamily="Georgia, serif">
        “
      </text>
      <rect x="18" y="16" width="48" height="5" rx="2.5" fill={strong} opacity="0.8" />
      <rect x="24" y="26" width="36" height="4" rx="2" fill={strong} opacity="0.55" />
    </>
  ),

  'text-testimonial': ({ accent, mid, faint, frame }) => (
    <>
      <rect x="6" y="5" width="68" height="38" rx="6" fill={faint} stroke={frame} strokeWidth="0.8" />
      <rect x="14" y="12" width="52" height="3" rx="1.5" fill={mid} />
      <rect x="14" y="18" width="46" height="3" rx="1.5" fill={mid} />
      <rect x="14" y="24" width="40" height="3" rx="1.5" fill={mid} />
      <circle cx="18" cy="34" r="4" fill={alpha(accent, 0.25)} />
      <rect x="25" y="31" width="24" height="3" rx="1.5" fill={accent} opacity="0.55" />
      <rect x="25" y="36" width="18" height="2" rx="1" fill={mid} opacity="0.7" />
    </>
  ),

  'text-calligraphy': ({ accent, mid }) => (
    <>
      <path
        d="M10 28 C24 10, 40 10, 52 24 C60 34, 70 30, 72 20"
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="22" y="36" width="36" height="3" rx="1.5" fill={mid} opacity="0.55" />
    </>
  ),

  'text-caption': ({ mid }) => (
    <>
      <rect x="16" y="18" width="48" height="3" rx="1.5" fill={mid} opacity="0.7" />
      <rect x="22" y="26" width="36" height="2.5" rx="1.25" fill={mid} opacity="0.45" />
    </>
  ),

  'text-callout': ({ accent, mid, faint }) => (
    <>
      <rect x="6" y="8" width="68" height="32" rx="5" fill={alpha(accent, 0.08)} stroke={alpha(accent, 0.28)} strokeWidth="0.9" />
      <rect x="10" y="12" width="3" height="24" rx="1.5" fill={accent} />
      <rect x="18" y="16" width="48" height="3" rx="1.5" fill={mid} />
      <rect x="18" y="23" width="42" height="3" rx="1.5" fill={mid} />
      <rect x="18" y="30" width="36" height="3" rx="1.5" fill={mid} />
    </>
  ),

  'button': ({ accent }) => (
    <>
      <rect x="14" y="13" width="52" height="22" rx="11" fill={alpha(accent, 0.16)} stroke={alpha(accent, 0.35)} strokeWidth="1" />
      <rect x="22" y="20.5" width="36" height="5" rx="2.5" fill={accent} opacity="0.55" />
    </>
  ),

  /* ─── Media ─────────────────────────────────────────────────────── */
  'image': ({ mid, faint, frame }) => (
    <>
      <rect x="5" y="4" width="70" height="40" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <polygon points="18,36 32,20 40,28 50,22 62,36" fill={mid} />
      <circle cx="58" cy="13" r="5.5" fill={alpha(mid, 0.55)} />
    </>
  ),

  'video': ({ accent, mid, faint, frame }) => (
    <>
      <rect x="5" y="4" width="70" height="40" rx="4" fill={faint} stroke={frame} strokeWidth="0.8" />
      <circle cx="40" cy="24" r="13" fill={alpha(accent, 0.12)} stroke={alpha(accent, 0.3)} strokeWidth="0.9" />
      <polygon points="36,17.5 36,30.5 50,24" fill={accent} opacity="0.55" />
    </>
  ),

  'logo': ({ accent, faint, frame }) => (
    <>
      <rect x="22" y="5" width="36" height="38" rx="8" fill={faint} stroke={frame} strokeWidth="0.8" />
      <polygon
        points="40,11 42.5,19 51,19 44.5,24 47,32 40,27 33,32 35.5,24 29,19 37.5,19"
        fill={alpha(accent, 0.45)}
        stroke={alpha(accent, 0.6)}
        strokeWidth="0.5"
      />
    </>
  ),

  'shape': ({ accent, mid, faint, frame }) => (
    <>
      <rect x="8" y="7" width="30" height="34" rx="6" fill={alpha(accent, 0.14)} stroke={alpha(accent, 0.32)} strokeWidth="0.9" />
      <circle cx="55" cy="24" r="15" fill={alpha(mid, 0.12)} stroke={mid} strokeWidth="0.9" opacity="0.85" />
    </>
  ),

  'icon': ({ accent, frame }) => (
    <>
      <rect x="29" y="13" width="22" height="22" rx="6" fill={alpha(accent, 0.14)} stroke={alpha(accent, 0.32)} strokeWidth="0.9" />
      <path d="M35 24 L40 19 L45 24" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </>
  ),

  'divider': ({ accent, mid }) => (
    <>
      <line x1="10" y1="19" x2="70" y2="19" stroke={mid} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="29" x2="70" y2="29" stroke={mid} strokeWidth="0.8" strokeDasharray="5 4" strokeLinecap="round" />
      <circle cx="40" cy="24" r="3.5" fill={alpha(accent, 0.3)} />
    </>
  )
}

interface Props {
  itemId: string
  itemType?: string
  itemIcon?: string
  height?: number
}

export function BlockThumbnail({ itemId, itemIcon, height = 52 }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const accent = theme.palette.primary.main

  const strong = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.30)'
  const mid = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.15)'
  const faint = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'
  const frame = isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.11)'
  const panelBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'

  const colors: Colors = { accent, strong, mid, faint, frame, panelBg }
  const renderer = THUMBNAILS[itemId]

  return (
    <Box
      sx={{
        width: '100%',
        height,
        borderRadius: 1.25,
        overflow: 'hidden',
        flexShrink: 0,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
      }}
    >
      {renderer ? (
        <svg
          width='100%'
          height='100%'
          viewBox='0 0 80 48'
          fill='none'
          preserveAspectRatio='xMidYMid meet'
          xmlns='http://www.w3.org/2000/svg'
        >
          {renderer(colors)}
        </svg>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            opacity: 0.7
          }}
        >
          <i className={itemIcon ?? 'ri-layout-line'} style={{ fontSize: '1.4rem' }} />
        </Box>
      )}
    </Box>
  )
}
