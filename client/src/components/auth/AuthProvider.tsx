'use client'

import { SessionProvider } from 'next-auth/react'

import type { ChildrenType } from '@core/types'

const AuthProvider = ({ children }: ChildrenType) => {
  return (
    <SessionProvider refetchOnWindowFocus refetchInterval={30}>
      {children}
    </SessionProvider>
  )
}

export default AuthProvider
