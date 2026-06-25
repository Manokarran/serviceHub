'use client'

import { useEffect, useState, type ReactNode } from 'react'

import Box from '@mui/material/Box'

type Props = {
  transitionKey: string
  children: ReactNode
}

export function SitePageTransition({ transitionKey, children }: Props) {
  const [visible, setVisible] = useState(true)
  const [renderedKey, setRenderedKey] = useState(transitionKey)

  useEffect(() => {
    if (transitionKey === renderedKey) {
      return
    }

    setVisible(false)

    const timeout = window.setTimeout(() => {
      setRenderedKey(transitionKey)
      setVisible(true)
    }, 180)

    return () => window.clearTimeout(timeout)
  }, [renderedKey, transitionKey])

  return (
    <Box
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.24s ease, transform 0.24s ease',
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </Box>
  )
}
