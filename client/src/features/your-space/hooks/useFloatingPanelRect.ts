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
  const skipPersist = useRef(false)
  const previousRect = useRef<PanelRect | null>(null)
  const userRectRef = useRef<PanelRect | null>(null)
  const parentRef = useRef<PanelSize>({ width: 0, height: 0 })

  useEffect(() => {
    const stored = readStoredPanelRect(storageKey)

    if (stored) {
      userRectRef.current = stored
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

    if (skipPersist.current) {
      skipPersist.current = false

      return
    }

    writeStoredPanelRect(storageKey, rect)
  }, [rect, storageKey])

  const rememberParent = (parent: PanelSize) => {
    parentRef.current = parent
    setParentSize(current => (current.width === parent.width && current.height === parent.height ? current : parent))
  }

  const rememberUserRect = (next: PanelRect) => {
    userRectRef.current = next
  }

  const commit = useCallback((next: PanelRect, parent: PanelSize, mode: PanelLayoutMode = 'overlay') => {
    rememberParent(parent)

    if (mode === 'docked') {
      setRect(current => {
        const base = current ?? defaultPanelRect(corner, parent, storageKey)
        const committed = { ...base, width: clampDockedPanelWidth(next.width, parent) }

        rememberUserRect(committed)

        return committed
      })

      return
    }

    const committed = clampPanelRect(next, parent)

    rememberUserRect(committed)
    setRect(committed)
  }, [corner, storageKey])

  const layoutCommit = useCallback((next: PanelRect, parent: PanelSize) => {
    rememberParent(parent)
    skipPersist.current = true
    setRect(clampPanelRect(next, parent))
  }, [])

  const restoreUser = useCallback(
    (parent: PanelSize) => {
      rememberParent(parent)

      const user = userRectRef.current ?? defaultPanelRect(corner, parent, storageKey)
      const next = clampPanelRect(user, parent)

      skipPersist.current = true
      setRect(current => (rectsEqual(current, next) ? current : next))
    },
    [corner, storageKey]
  )

  const ensureLayout = useCallback(
    (parent: PanelSize, mode: PanelLayoutMode = 'overlay') => {
      rememberParent(parent)

      setRect(current => {
        if (parent.width < 80 || parent.height < 80) {
          return current
        }

        if (!current) {
          const initial = defaultPanelRect(corner, parent, storageKey)

          rememberUserRect(initial)

          return mode === 'docked'
            ? { ...initial, width: clampDockedPanelWidth(initial.width, parent) }
            : initial
        }

        const next =
          mode === 'docked'
            ? { ...current, width: clampDockedPanelWidth(current.width, parent) }
            : clampPanelRect(current, parent)

        if (mode === 'docked' || rectsEqual(current, userRectRef.current)) {
          rememberUserRect(next)
        }

        return rectsEqual(current, next) ? current : next
      })
    },
    [corner, storageKey]
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
          const base = current ?? defaultPanelRect(corner, parent, storageKey)

          if (isDockedMaximized(base, parent)) {
            const restoredWidth = previousRect.current
              ? clampDockedPanelWidth(previousRect.current.width, parent)
              : defaultPanelRect(corner, parent, storageKey).width
            const restored = { ...base, width: restoredWidth }

            rememberUserRect(restored)

            return restored
          }

          previousRect.current = base
          rememberUserRect({ ...base, width: maxWidth })

          return { ...base, width: maxWidth }
        }

        if (current && isMaximizedRect(current, parent)) {
          const restored = previousRect.current
            ? clampPanelRect(previousRect.current, parent)
            : defaultPanelRect(corner, parent, storageKey)

          rememberUserRect(restored)

          return restored
        }

        if (current) {
          previousRect.current = current
        }

        const maximized = maximizePanelRect(parent)

        rememberUserRect(maximized)

        return maximized
      })
    },
    [corner, storageKey]
  )

  return {
    rect,
    parentSize,
    commit,
    layoutCommit,
    restoreUser,
    ensureLayout,
    maximize
  }
}
