import { redirect } from 'next/navigation'

import { isManagerRole } from '@/lib/constants/roles'
import { requireOpenTenantOrRedirect } from '@/lib/auth/require-approved-tenant-page'
import { bookingService } from '@/services/booking/booking.service'
import { BookingsPageClient } from '@/features/bookings/components/BookingsPageClient'

export default async function BookingsPage() {
  const { session } = await requireOpenTenantOrRedirect()

  if (!session.user.tenantId || !isManagerRole(session.user.role)) {
    redirect('/home')
  }

  const recentFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const bookings = await bookingService.listTenantBookings(session.user.tenantId, { from: recentFrom })

  return <BookingsPageClient initialBookings={bookings} />
}
