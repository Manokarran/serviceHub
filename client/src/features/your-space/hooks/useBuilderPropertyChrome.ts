'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { readBuilderPropertyChrome, writeBuilderPropertyChrome } from '../utils/builderContainerChrome'

type Options = {

  /** Keep the properties dock closed so a fresh site lands canvas-first. */
  forceClosed?: boolean
}

export function useBuilderPropertyChrome(options: Options = {}) {
  const { forceClosed = false } = options
  const [propertyPinned, setPropertyPinned] = useState(!forceClosed)
  const [chromeReady, setChromeReady] = useState(false)
  const skipWrite = useRef(true)

  useEffect(() => {
    const stored = readBuilderPropertyChrome()

    setPropertyPinned(forceClosed ? false : stored.pinned)
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
