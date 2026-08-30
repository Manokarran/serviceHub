import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isManagerRole } from '@/lib/constants/roles'
import { bookingService } from '@/services/booking/booking.service'
import { BookingsPageClient } from '@/features/bookings/components/BookingsPageClient'

export default async function BookingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.registrationComplete) {
    redirect('/register')
  }

  if (!session.user.tenantId || !isManagerRole(session.user.role)) {
    redirect('/home')
  }

  const recentFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const bookings = await bookingService.listTenantBookings(session.user.tenantId, { from: recentFrom })

  return <BookingsPageClient initialBookings={bookings} />
}
