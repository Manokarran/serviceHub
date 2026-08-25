'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { readBuilderPropertyChrome, writeBuilderPropertyChrome } from '../utils/builderContainerChrome'

export function useBuilderPropertyChrome() {
  const [propertyPinned, setPropertyPinned] = useState(false)
  const [chromeReady, setChromeReady] = useState(false)
  const skipWrite = useRef(true)

  useEffect(() => {
    setPropertyPinned(readBuilderPropertyChrome().pinned)
    setChromeReady(true)
  }, [])

  useEffect(() => {
    if (!chromeReady) {
      return
    }

    if (skipWrite.current) {
      skipWrite.current = false

      return
    }

    writeBuilderPropertyChrome({ pinned: propertyPinned })
  }, [chromeReady, propertyPinned])

  const togglePropertyPinned = useCallback(() => {
    setPropertyPinned(current => !current)
  }, [])

  return {
    propertyPinned,
    propertyChromeReady: chromeReady,
    togglePropertyPinned
  }
}
