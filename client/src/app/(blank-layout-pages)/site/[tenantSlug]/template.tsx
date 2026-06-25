'use client'

import { usePathname } from 'next/navigation'

import { SitePageTransition } from '@/features/your-space/components/SitePageTransition'

export default function PublicSiteTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return <SitePageTransition transitionKey={pathname}>{children}</SitePageTransition>
}
