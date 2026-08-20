'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import type { BlockColumn } from '../utils/blockTreeUtils'

export type NestTargetHint =
  | { kind: 'carousel'; slotId: string; label: string }
  | { kind: 'tabs'; slotId: string; label: string }
  | { kind: 'section'; column: BlockColumn; label: string }

export type NestTargetHints = Record<string, NestTargetHint>

type BuilderNestTargetsContextValue = {
  hints: NestTargetHints
  isCanvasDragging: boolean
  setCanvasDragging: (dragging: boolean) => void
  setNestTarget: (blockId: string, hint: NestTargetHint) => void
  clearNestTarget: (blockId: string) => void
}

const BuilderNestTargetsContext = createContext<BuilderNestTargetsContextValue | null>(null)

export function BuilderNestTargetsProvider({ children }: { children: ReactNode }) {
  const [hints, setHints] = useState<NestTargetHints>({})
  const [isCanvasDragging, setIsCanvasDragging] = useState(false)

  const setNestTarget = useCallback((blockId: string, hint: NestTargetHint) => {
    setHints(prev => {
      const existing = prev[blockId]

      if (
        existing &&
        existing.kind === hint.kind &&
        existing.label === hint.label &&
        (('slotId' in existing && 'slotId' in hint && existing.slotId === hint.slotId) ||
          ('column' in existing && 'column' in hint && existing.column === hint.column))
      ) {
        return prev
      }

      return { ...prev, [blockId]: hint }
    })
  }, [])

  const clearNestTarget = useCallback((blockId: string) => {
    setHints(prev => {
      if (!(blockId in prev)) {
        return prev
      }

      const next = { ...prev }
      delete next[blockId]

      return next
    })
  }, [])

  const setCanvasDragging = useCallback((dragging: boolean) => {
    setIsCanvasDragging(dragging)
  }, [])

  const value = useMemo(
    () => ({
      hints,
      isCanvasDragging,
      setCanvasDragging,
      setNestTarget,
      clearNestTarget
    }),
    [hints, isCanvasDragging, setCanvasDragging, setNestTarget, clearNestTarget]
  )

  return <BuilderNestTargetsContext.Provider value={value}>{children}</BuilderNestTargetsContext.Provider>
}

export function useBuilderNestTargets() {
  const ctx = useContext(BuilderNestTargetsContext)

  if (!ctx) {
    throw new Error('useBuilderNestTargets must be used within BuilderNestTargetsProvider')
  }

  return ctx
}

export function useBuilderNestTargetsOptional() {
  return useContext(BuilderNestTargetsContext)
}
