// MUI Imports
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

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
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
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
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
        <MenuItem href='/your-space' icon={<i className='ri-layout-masonry-line' />}>
          Your Space
        </MenuItem>
        {canManageLeads ? (
          <MenuItem href='/services' icon={<i className='ri-calendar-check-line' />}>
            Services
          </MenuItem>
        ) : null}
        {canManageLeads ? (
          <MenuItem href='/bookings' icon={<i className='ri-calendar-todo-line' />}>
            Bookings
          </MenuItem>
        ) : null}
        {canManageLeads ? (
          <MenuItem href='/leads' icon={<i className='ri-mail-line' />}>
            Leads
          </MenuItem>
        ) : null}
        <MenuItem href='/about' icon={<i className='ri-information-line' />}>
          About
        </MenuItem>
        {isSuperAdmin ? (
          <MenuSection label='Super Admin'>
            <MenuItem href='/super-admin' icon={<i className='ri-shield-star-line' />}>
              Dashboard
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
      {/* <Menu
        popoutMenuOffset={{ mainAxis: 10 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <GenerateVerticalMenu menuData={menuData(dictionary)} />
      </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
