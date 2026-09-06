'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { readBuilderAiChrome, writeBuilderAiChrome } from '../utils/builderContainerChrome'

export function useBuilderAiChrome(forceOpenFromQuery = false) {
  const [aiChatOpen, setAiChatOpen] = useState(true)
  const [aiChatPinned, setAiChatPinned] = useState(true)
  const [chromeReady, setChromeReady] = useState(false)
  const skipWrite = useRef(true)

  useEffect(() => {
    const stored = readBuilderAiChrome()

    setAiChatPinned(stored.pinned)
    setAiChatOpen(forceOpenFromQuery || stored.open)
    setChromeReady(true)
  }, [forceOpenFromQuery])

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
