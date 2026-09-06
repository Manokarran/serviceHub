'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { BuilderSidebarPanel } from '../types'
import { readBuilderLeftChrome, writeBuilderLeftChrome } from '../utils/builderContainerChrome'

type Options = {

  /** Start with every left dock panel closed so the canvas owns the view. */
  forceClosed?: boolean
}

export function useBuilderLeftChrome(options: Options = {}) {
  const { forceClosed = false } = options
  const [leftPanel, setLeftPanel] = useState<BuilderSidebarPanel | null>(forceClosed ? null : 'blocks')
  const [leftPinned, setLeftPinned] = useState(true)
  const [chromeReady, setChromeReady] = useState(false)
  const skipWrite = useRef(true)

  useEffect(() => {
    const stored = readBuilderLeftChrome()

    setLeftPinned(stored.pinned)
    setLeftPanel(forceClosed ? null : stored.panel)
    setChromeReady(true)
  }, [forceClosed])

  useEffect(() => {
    if (!chromeReady) {
      return
    }

    if (skipWrite.current) {
      skipWrite.current = false

      return
    }

    writeBuilderLeftChrome({
      panel: leftPanel,
      pinned: leftPinned,
      expanded: false,
      offset: { x: 0, y: 0 }
    })
  }, [chromeReady, leftPanel, leftPinned])

  const togglePanel = useCallback((panel: BuilderSidebarPanel) => {
    setLeftPanel(current => (current === panel ? null : panel))
  }, [])

  const closePanel = useCallback(() => {
    setLeftPanel(null)
  }, [])

  const togglePinned = useCallback(() => {
    setLeftPinned(current => !current)
  }, [])

  return {
    leftPanel,
    leftPinned,
    chromeReady,
    togglePanel,
    closePanel,
    togglePinned
  }
}
