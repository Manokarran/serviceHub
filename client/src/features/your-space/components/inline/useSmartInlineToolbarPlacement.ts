'use client'

import { useLayoutEffect, useState, type RefObject } from 'react'

import type { Block } from '../../types'

const TOOLBAR_CLEARANCE = 52
const TOOLBAR_GAP = 10

function findScrollParent(element: HTMLElement | null): HTMLElement {
  let node = element?.parentElement

  while (node) {
    const { overflowY, overflow } = getComputedStyle(node)

    if (/(auto|scroll|overlay)/.test(`${overflowY} ${overflow}`)) {
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
  preferBelow: boolean
): 'above' | 'below' {
  const blockRect = blockEl.getBoundingClientRect()
  const scrollParent = findScrollParent(blockEl)
  const parentRect = scrollParent.getBoundingClientRect()
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
  preferBelow = false
): 'above' | 'below' {
  const softPreferBelow = preferBelow || prefersBelowPlacement(block)
  const [placement, setPlacement] = useState<'above' | 'below'>(softPreferBelow ? 'below' : 'above')

  useLayoutEffect(() => {
    if (!isSelected || !blockRef.current) {
      return
    }

    const updatePlacement = () => {
      if (!blockRef.current) {
        return
      }

      setPlacement(measurePlacement(blockRef.current, isInlineEditing, softPreferBelow))
    }

    updatePlacement()

    const scrollParent = findScrollParent(blockRef.current)
    scrollParent.addEventListener('scroll', updatePlacement, { passive: true })
    window.addEventListener('resize', updatePlacement, { passive: true })

    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePlacement) : null

    observer?.observe(blockRef.current)

    return () => {
      scrollParent.removeEventListener('scroll', updatePlacement)
      window.removeEventListener('resize', updatePlacement)
      observer?.disconnect()
    }
  }, [block.id, blockRef, isInlineEditing, isSelected, softPreferBelow])

  return placement
}

export const INLINE_TOOLBAR_GAP_PX = TOOLBAR_GAP
