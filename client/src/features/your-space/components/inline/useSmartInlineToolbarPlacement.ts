'use client'

import { useLayoutEffect, useState, type RefObject } from 'react'

import type { Block } from '../../types'

const TOOLBAR_CLEARANCE = 52
const TOOLBAR_GAP = 10

export type InlineToolbarPlacement = 'above' | 'below' | 'inside'

function findClippingParent(element: HTMLElement | null): HTMLElement {
  let node = element?.parentElement

  while (node) {
    const { overflowY, overflowX, overflow } = getComputedStyle(node)

    if (/(hidden|auto|scroll|overlay|clip)/.test(`${overflowY} ${overflowX} ${overflow}`)) {
      return node
    }

    node = node.parentElement
  }

  return document.documentElement
}

function prefersBelowPlacement(block: Block): boolean {
  return block.type === 'text' || block.type === 'heading' || block.type === 'logo' || block.type === 'button'
}

/**
 * Pick above/below so the toolbar never covers the block body.
 * Prefers below for text-like blocks when there is room; otherwise uses the side with more space.
 */
function measurePlacement(
  blockEl: HTMLElement,
  isInlineEditing: boolean,
  preferBelow: boolean,
  nested: boolean
): InlineToolbarPlacement {
  if (nested) {
    return 'inside'
  }

  const blockRect = blockEl.getBoundingClientRect()
  const clipParent = findClippingParent(blockEl)
  const parentRect = clipParent.getBoundingClientRect()
  const spaceAbove = Math.max(0, blockRect.top - parentRect.top)
  const spaceBelow = Math.max(0, parentRect.bottom - blockRect.bottom)

  // While editing, keep the toolbar out of the text — prefer below when possible.
  if (isInlineEditing) {
    if (spaceBelow >= TOOLBAR_CLEARANCE) {
      return 'below'
    }

    if (spaceAbove >= TOOLBAR_CLEARANCE) {
      return 'above'
    }

    return spaceBelow >= spaceAbove ? 'below' : 'above'
  }

  if (preferBelow) {
    if (spaceBelow >= TOOLBAR_CLEARANCE) {
      return 'below'
    }

    if (spaceAbove >= TOOLBAR_CLEARANCE) {
      return 'above'
    }

    return spaceBelow >= spaceAbove ? 'below' : 'above'
  }

  if (spaceAbove >= TOOLBAR_CLEARANCE) {
    return 'above'
  }

  if (spaceBelow >= TOOLBAR_CLEARANCE) {
    return 'below'
  }

  return spaceBelow > spaceAbove ? 'below' : 'above'
}

export function useSmartInlineToolbarPlacement(
  blockRef: RefObject<HTMLElement | null>,
  block: Block,
  isSelected: boolean,
  isInlineEditing: boolean,
  preferBelow = false,
  nested = false
): InlineToolbarPlacement {
  const softPreferBelow = preferBelow || prefersBelowPlacement(block)
  const [placement, setPlacement] = useState<InlineToolbarPlacement>(
    nested ? 'inside' : softPreferBelow ? 'below' : 'above'
  )

  useLayoutEffect(() => {
    if (!isSelected || !blockRef.current) {
      return
    }

    const updatePlacement = () => {
      if (!blockRef.current) {
        return
      }

      setPlacement(measurePlacement(blockRef.current, isInlineEditing, softPreferBelow, nested))
    }

    updatePlacement()

    const clipParent = findClippingParent(blockRef.current)
    clipParent.addEventListener('scroll', updatePlacement, { passive: true })
    window.addEventListener('resize', updatePlacement, { passive: true })

    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePlacement) : null

    observer?.observe(blockRef.current)

    return () => {
      clipParent.removeEventListener('scroll', updatePlacement)
      window.removeEventListener('resize', updatePlacement)
      observer?.disconnect()
    }
  }, [block.id, blockRef, isInlineEditing, isSelected, nested, softPreferBelow])

  return placement
}

export const INLINE_TOOLBAR_GAP_PX = TOOLBAR_GAP
