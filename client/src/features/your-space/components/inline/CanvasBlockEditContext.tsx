'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import type { Block } from '../../types'

type CanvasBlockEditContextValue = {
  blockId: string
  blockType: Block['type']
  updateProps: (changes: Partial<Block['props']>) => void
  inlineEditingField: string | null
  setInlineEditingField: (field: string | null) => void
}

const CanvasBlockEditContext = createContext<CanvasBlockEditContextValue | null>(null)

export function CanvasBlockEditProvider({
  block,
  updateProps,
  children
}: {
  block: Block
  updateProps: (changes: Partial<Block['props']>) => void
  children: ReactNode
}) {
  const [inlineEditingField, setInlineEditingField] = useState<string | null>(null)

  const value = useMemo(
    () => ({
      blockId: block.id,
      blockType: block.type,
      updateProps,
      inlineEditingField,
      setInlineEditingField
    }),
    [block.id, block.type, inlineEditingField, updateProps]
  )

  return (
    <CanvasBlockEditContext.Provider value={value}>
      {children}
    </CanvasBlockEditContext.Provider>
  )
}

export function useCanvasBlockEdit() {
  return useContext(CanvasBlockEditContext)
}
