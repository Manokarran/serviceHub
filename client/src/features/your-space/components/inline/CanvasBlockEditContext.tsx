'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { Block } from '../../types'

type CanvasBlockEditContextValue = {
  blockId: string
  blockType: Block['type']
  updateProps: (changes: Partial<Block['props']>) => void
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
  return (
    <CanvasBlockEditContext.Provider
      value={{ blockId: block.id, blockType: block.type, updateProps }}
    >
      {children}
    </CanvasBlockEditContext.Provider>
  )
}

export function useCanvasBlockEdit() {
  return useContext(CanvasBlockEditContext)
}
