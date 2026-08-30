// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'

const horizontalMenuData = (): HorizontalMenuDataType[] => [
  {
    label: 'Home',
    href: '/home',
    icon: 'ri-home-smile-line'
  },
  {
    label: 'Your Space',
    href: '/your-space',
    icon: 'ri-layout-masonry-line'
  },
  {
    label: 'Services',
    href: '/services',
    icon: 'ri-calendar-check-line'
  },
  {
    label: 'Bookings',
    href: '/bookings',
    icon: 'ri-calendar-todo-line'
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: 'ri-mail-line'
  },
  {
    label: 'About',
    href: '/about',
    icon: 'ri-information-line'
  }
]

export default horizontalMenuData
