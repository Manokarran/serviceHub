'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import type { Block, BlockType } from '../../types'

type InlineEditRequest = {
  field: string
  token: number
}

type CanvasBlockEditContextValue = {
  blockId: string
  blockType: Block['type']
  updateProps: (changes: Partial<Block['props']>) => void
  inlineEditingField: string | null
  setInlineEditingField: (field: string | null) => void
  inlineEditRequest: InlineEditRequest | null
  requestInlineEdit: (field?: string) => void
}

const CanvasBlockEditContext = createContext<CanvasBlockEditContextValue | null>(null)

/** Primary inline-editable field for common content blocks. */
export function getPrimaryInlineEditField(type: BlockType): string | null {
  switch (type) {
    case 'heading':
    case 'text':
    case 'button':
      return 'text'
    case 'hero':
      return 'title'
    case 'header':
    case 'footer':
      return 'logoText'
    case 'logo':
      return 'text'
    default:
      return null
  }
}

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
  const [inlineEditRequest, setInlineEditRequest] = useState<InlineEditRequest | null>(null)

  const requestInlineEdit = useCallback((field?: string) => {
    const nextField = field ?? getPrimaryInlineEditField(block.type) ?? 'text'

    setInlineEditRequest({ field: nextField, token: Date.now() })
  }, [block.type])

  const value = useMemo(
    () => ({
      blockId: block.id,
      blockType: block.type,
      updateProps,
      inlineEditingField,
      setInlineEditingField,
      inlineEditRequest,
      requestInlineEdit
    }),
    [block.id, block.type, inlineEditingField, inlineEditRequest, requestInlineEdit, updateProps]
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
