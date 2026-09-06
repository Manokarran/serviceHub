// MUI Imports
import Tooltip from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import { useSession } from 'next-auth/react'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Util Imports
import { isManagerRole } from '@/lib/constants/roles'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { data: session } = useSession()
  const canManageLeads = isManagerRole(session?.user?.role)
  const isSuperAdmin = Boolean(session?.user?.isSuperAdmin)
  // Super admins still need org approval for publish; workspace opens while pending
  const workspaceOpen = session?.user?.tenantWorkspaceOpen !== false
  const lockedTitle = 'Access declined'

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const lockedItem = (label: string, icon: string) => (
    <Tooltip title={lockedTitle} placement='right'>
      <span>
        <MenuItem disabled icon={<i className={icon} />}>
          {label}
        </MenuItem>
      </span>
    </Tooltip>
  )

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 10 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href='/home' icon={<i className='ri-home-smile-line' />}>
          Home
        </MenuItem>
        {workspaceOpen ? (
          <MenuItem href='/your-space' icon={<i className='ri-layout-masonry-line' />}>
            Your Space
          </MenuItem>
        ) : (
          lockedItem('Your Space', 'ri-layout-masonry-line')
        )}
        {canManageLeads ? (
          workspaceOpen ? (
            <MenuItem href='/services' icon={<i className='ri-calendar-check-line' />}>
              Services
            </MenuItem>
          ) : (
            lockedItem('Services', 'ri-calendar-check-line')
          )
        ) : null}
        {canManageLeads ? (
          workspaceOpen ? (
            <MenuItem href='/bookings' icon={<i className='ri-calendar-todo-line' />}>
              Bookings
            </MenuItem>
          ) : (
            lockedItem('Bookings', 'ri-calendar-todo-line')
          )
        ) : null}
        {canManageLeads ? (
          workspaceOpen ? (
            <MenuItem href='/leads' icon={<i className='ri-mail-line' />}>
              Leads
            </MenuItem>
          ) : (
            lockedItem('Leads', 'ri-mail-line')
          )
        ) : null}
        {isSuperAdmin ? (
          <MenuSection label='Super Admin'>
            <MenuItem href='/super-admin' icon={<i className='ri-shield-star-line' />}>
              Dashboard
            </MenuItem>
            <MenuItem href='/super-admin/requests' icon={<i className='ri-user-follow-line' />}>
              Registration requests
            </MenuItem>
            <MenuItem href='/super-admin/credits' icon={<i className='ri-coin-line' />}>
              AI credits
            </MenuItem>
            <MenuItem href='/super-admin/studio' icon={<i className='ri-palette-line' />}>
              Design studio
            </MenuItem>
            <MenuItem href='/super-admin/templates' icon={<i className='ri-layout-grid-line' />}>
              Template library
            </MenuItem>
          </MenuSection>
        ) : null}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
