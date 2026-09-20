'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import Logo from '@components/layout/shared/Logo'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import { CreditsBadge } from '@components/layout/shared/CreditsBadge'
import { ImpersonationBanner } from '@components/layout/shared/ImpersonationBanner'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = () => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <div className='flex flex-col is-full'>
      <ImpersonationBanner />
      <div
        className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
      >
        <div className='flex items-center gap-4'>
          <NavToggle />
          {/* Hide Logo on Smaller screens */}
          {!isBreakpointReached && <Logo />}
        </div>
        <div className='flex items-center gap-3'>
          <CreditsBadge />
          <ModeDropdown />
          <UserDropdown />
        </div>
      </div>
    </div>
  )
}

export default NavbarContent
