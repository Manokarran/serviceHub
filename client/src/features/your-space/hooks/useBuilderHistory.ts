'use client'

import { useCallback, useRef, useState } from 'react'

const MAX_HISTORY_STEPS = 40
const COALESCE_MS = 700

export type BuilderHistoryEntry<T> = {
  snapshot: T
  label?: string
}

export type RecordHistoryOptions = {
  /** When set, rapid changes with the same key share one undo step (typing, sliders). */
  coalesceKey?: string
  label?: string
}

/**
 * Session undo/redo for the open page draft. Snapshots are taken *before* a mutation.
 * Cleared on page switch / manual save. Undoing back to the last saved draft clears
 * older undo steps so Unsaved* goes away and you cannot go past that floor.
 */
export function useBuilderHistory<T>(getSnapshot: () => T) {
  const undoStackRef = useRef<BuilderHistoryEntry<T>[]>([])
  const redoStackRef = useRef<BuilderHistoryEntry<T>[]>([])
  const coalesceKeyRef = useRef<string | null>(null)
  const coalesceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isRestoringRef = useRef(false)
  const [, setTick] = useState(0)

  const notify = useCallback(() => {
    setTick(value => value + 1)
  }, [])

  const clearCoalesce = useCallback(() => {
    coalesceKeyRef.current = null

    if (coalesceTimerRef.current) {
      clearTimeout(coalesceTimerRef.current)
      coalesceTimerRef.current = null
    }
  }, [])

  const clearHistory = useCallback(() => {
    undoStackRef.current = []
    redoStackRef.current = []
    clearCoalesce()
    notify()
  }, [clearCoalesce, notify])

  const recordBeforeChange = useCallback(
    (options?: RecordHistoryOptions) => {
      if (isRestoringRef.current) {
        return
      }

      const coalesceKey = options?.coalesceKey ?? null

      if (coalesceKey && coalesceKeyRef.current === coalesceKey) {
        if (coalesceTimerRef.current) {
          clearTimeout(coalesceTimerRef.current)
        }

        coalesceTimerRef.current = setTimeout(() => {
          coalesceKeyRef.current = null
          coalesceTimerRef.current = null
        }, COALESCE_MS)

        return
      }

      undoStackRef.current = [
        ...undoStackRef.current,
        { snapshot: getSnapshot(), label: options?.label }
      ].slice(-MAX_HISTORY_STEPS)
      redoStackRef.current = []

      if (coalesceKey) {
        coalesceKeyRef.current = coalesceKey

        if (coalesceTimerRef.current) {
          clearTimeout(coalesceTimerRef.current)
        }

        coalesceTimerRef.current = setTimeout(() => {
          coalesceKeyRef.current = null
          coalesceTimerRef.current = null
        }, COALESCE_MS)
      } else {
        clearCoalesce()
      }

      notify()
    },
    [clearCoalesce, getSnapshot, notify]
  )

  const undo = useCallback(
    (restore: (snapshot: T) => { hitFloor?: boolean } | void) => {
      const entry = undoStackRef.current.at(-1)

      if (!entry) {
        return false
      }

      clearCoalesce()
      undoStackRef.current = undoStackRef.current.slice(0, -1)
      redoStackRef.current = [
        ...redoStackRef.current,
        { snapshot: getSnapshot(), label: entry.label }
      ].slice(-MAX_HISTORY_STEPS)

      isRestoringRef.current = true
      const result = restore(entry.snapshot)

      // Last saved draft is the floor — drop older undo steps, keep redo.
      if (result?.hitFloor) {
        undoStackRef.current = []
      }

      queueMicrotask(() => {
        isRestoringRef.current = false
      })
      notify()

      return true
    },
    [clearCoalesce, getSnapshot, notify]
  )

  const redo = useCallback(
    (restore: (snapshot: T) => void) => {
      const entry = redoStackRef.current.at(-1)

      if (!entry) {
        return false
      }

      clearCoalesce()
      redoStackRef.current = redoStackRef.current.slice(0, -1)
      undoStackRef.current = [
        ...undoStackRef.current,
        { snapshot: getSnapshot(), label: entry.label }
      ].slice(-MAX_HISTORY_STEPS)

      isRestoringRef.current = true
      restore(entry.snapshot)
      queueMicrotask(() => {
        isRestoringRef.current = false
      })
      notify()

      return true
    },
    [clearCoalesce, getSnapshot, notify]
  )

  return {
    canUndo: undoStackRef.current.length > 0,
    canRedo: redoStackRef.current.length > 0,
    undoDepth: undoStackRef.current.length,
    redoDepth: redoStackRef.current.length,
    recordBeforeChange,
    undo,
    redo,
    clearHistory
  }
}
