'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  clampDockedPanelWidth,
  clampPanelRect,
  defaultPanelRect,
  isDockedMaximized,
  isMaximizedRect,
  maximizePanelRect,
  readStoredPanelRect,
  rectsEqual,
  writeStoredPanelRect,
  type PanelLayoutMode,
  type PanelRect,
  type PanelSize
} from '../utils/builderPanelFrame'

export function useFloatingPanelRect(storageKey: string, corner: 'left' | 'right') {
  const [rect, setRect] = useState<PanelRect | null>(null)
  const [parentSize, setParentSize] = useState<PanelSize>({ width: 0, height: 0 })
  const skipWrite = useRef(true)
  const previousRect = useRef<PanelRect | null>(null)
  const parentRef = useRef<PanelSize>({ width: 0, height: 0 })

  useEffect(() => {
    const stored = readStoredPanelRect(storageKey)

    if (stored) {
      setRect(stored)
    }

    skipWrite.current = true
  }, [storageKey])

  useEffect(() => {
    if (!rect) {
      return
    }

    if (skipWrite.current) {
      skipWrite.current = false

      return
    }

    writeStoredPanelRect(storageKey, rect)
  }, [rect, storageKey])

  const rememberParent = (parent: PanelSize) => {
    parentRef.current = parent
    setParentSize(current => (current.width === parent.width && current.height === parent.height ? current : parent))
  }

  const commit = useCallback((next: PanelRect, parent: PanelSize, mode: PanelLayoutMode = 'overlay') => {
    rememberParent(parent)

    if (mode === 'docked') {
      setRect(current => {
        const base = current ?? defaultPanelRect(corner, parent)

        return { ...base, width: clampDockedPanelWidth(next.width, parent) }
      })

      return
    }

    setRect(clampPanelRect(next, parent))
  }, [corner])

  const ensureLayout = useCallback(
    (parent: PanelSize, mode: PanelLayoutMode = 'overlay') => {
      rememberParent(parent)

      setRect(current => {
        if (parent.width < 80 || parent.height < 80) {
          return current
        }

        if (!current) {
          return defaultPanelRect(corner, parent)
        }

        const next =
          mode === 'docked'
            ? { ...current, width: clampDockedPanelWidth(current.width, parent) }
            : clampPanelRect(current, parent)

        return rectsEqual(current, next) ? current : next
      })
    },
    [corner]
  )

  const maximize = useCallback(
    (mode: PanelLayoutMode = 'overlay') => {
      const parent = parentRef.current

      if (parent.width < 80 || parent.height < 80) {
        return
      }

      setRect(current => {
        if (mode === 'docked') {
          const maxWidth = clampDockedPanelWidth(Number.POSITIVE_INFINITY, parent)
          const base = current ?? defaultPanelRect(corner, parent)

          if (isDockedMaximized(base, parent)) {
            const restoredWidth = previousRect.current
              ? clampDockedPanelWidth(previousRect.current.width, parent)
              : defaultPanelRect(corner, parent).width

            return { ...base, width: restoredWidth }
          }

          previousRect.current = base

          return { ...base, width: maxWidth }
        }

        if (current && isMaximizedRect(current, parent)) {
          return previousRect.current ? clampPanelRect(previousRect.current, parent) : defaultPanelRect(corner, parent)
        }

        if (current) {
          previousRect.current = current
        }

        return maximizePanelRect(parent)
      })
    },
    [corner]
  )

  return {
    rect,
    parentSize,
    commit,
    ensureLayout,
    maximize
  }
}
