'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { readBuilderAiChrome, writeBuilderAiChrome } from '../utils/builderContainerChrome'

type Options = {

  /** Open the AI chat even if the user previously closed it. */
  forceOpen?: boolean

  /** Float the chat instead of docking it into the layout. */
  forceUnpinned?: boolean

  /** Dock the chat into the layout (e.g. registration landing outside the canvas). */
  forcePinned?: boolean
}

export function useBuilderAiChrome(options: Options = {}) {
  const { forceOpen = false, forceUnpinned = false, forcePinned = false } = options
  const [aiChatOpen, setAiChatOpen] = useState(true)
  const [aiChatPinned, setAiChatPinned] = useState(forcePinned || !forceUnpinned)
  const [chromeReady, setChromeReady] = useState(false)
  const skipWrite = useRef(true)

  useEffect(() => {
    const stored = readBuilderAiChrome()

    setAiChatPinned(forcePinned ? true : forceUnpinned ? false : stored.pinned)
    setAiChatOpen(forceOpen || forcePinned || forceUnpinned || stored.open)
    setChromeReady(true)
  }, [forceOpen, forcePinned, forceUnpinned])

  useEffect(() => {
    if (!chromeReady) {
      return
    }

    if (skipWrite.current) {
      skipWrite.current = false

      return
    }

    writeBuilderAiChrome({
      open: aiChatOpen,
      pinned: aiChatPinned
    })
  }, [aiChatOpen, aiChatPinned, chromeReady])

  const openAiChat = useCallback(() => {
    setAiChatOpen(true)
  }, [])

  const closeAiChat = useCallback(() => {
    setAiChatOpen(false)
  }, [])

  return {
    aiChatOpen,
    setAiChatOpen,
    aiChatPinned,
    setAiChatPinned,
    aiChromeReady: chromeReady,
    openAiChat,
    closeAiChat
  }
}
