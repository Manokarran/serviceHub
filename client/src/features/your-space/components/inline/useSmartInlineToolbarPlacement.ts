'use client'

import { useLayoutEffect, useState, type RefObject } from 'react'

import type { Block } from '../../types'

const TOOLBAR_CLEARANCE = 44

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

function measurePlacement(
  blockEl: HTMLElement,
  isInlineEditing: boolean
): 'above' | 'below' {
  const blockRect = blockEl.getBoundingClientRect()
  const scrollParent = findScrollParent(blockEl)
  const parentRect = scrollParent.getBoundingClientRect()
  const spaceAbove = blockRect.top - parentRect.top
  const spaceBelow = parentRect.bottom - blockRect.bottom

  if (isInlineEditing) {
    return spaceBelow >= TOOLBAR_CLEARANCE || spaceBelow >= spaceAbove ? 'below' : 'above'
  }

  if (spaceAbove >= TOOLBAR_CLEARANCE) {
    return 'above'
  }

  if (spaceBelow >= TOOLBAR_CLEARANCE) {
    return 'below'
  }

  return spaceBelow > spaceAbove ? 'below' : 'above'
}

function prefersBelowPlacement(block: Block): boolean {
  return block.type === 'text' || block.type === 'heading' || block.type === 'logo'
}

export function useSmartInlineToolbarPlacement(
  blockRef: RefObject<HTMLElement | null>,
  block: Block,
  isSelected: boolean,
  isInlineEditing: boolean,
  preferBelow = false
): 'above' | 'below' {
  const [placement, setPlacement] = useState<'above' | 'below'>(
    preferBelow || prefersBelowPlacement(block) ? 'below' : 'above'
  )

  useLayoutEffect(() => {
    if (!isSelected || !blockRef.current) {
      return
    }

    const updatePlacement = () => {
      if (!blockRef.current) {
        return
      }

      if (preferBelow || prefersBelowPlacement(block)) {
        setPlacement('below')

        return
      }

      setPlacement(measurePlacement(blockRef.current, isInlineEditing))
    }

    updatePlacement()

    const scrollParent = findScrollParent(blockRef.current)
    scrollParent.addEventListener('scroll', updatePlacement, { passive: true })
    window.addEventListener('resize', updatePlacement, { passive: true })

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updatePlacement)
        : null

    observer?.observe(blockRef.current)

    return () => {
      scrollParent.removeEventListener('scroll', updatePlacement)
      window.removeEventListener('resize', updatePlacement)
      observer?.disconnect()
    }
  }, [block.id, block.type, blockRef, isInlineEditing, isSelected, preferBelow])

  return placement
}
