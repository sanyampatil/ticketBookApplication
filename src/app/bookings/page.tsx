'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { Ticket, Clock, MapPin, Users, XCircle, RefreshCw, ChevronRight } from 'lucide-react'

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/bookings')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/bookings')
        .then((r) => r.json())
        .then((d) => { setBookings(d.bookings || []); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [status])

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(bookingId)
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b))
      )
    } catch (e) {
      alert('Failed to cancel booking')
    } finally {
      setCancelling(null)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading your bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 text-sm mt-1">Hello, {session?.user?.name} 👋</p>
          </div>
          <div className="text-sm text-gray-500">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-display font-semibold text-gray-700 mb-2">No bookings yet</h3>
            <p className="text-gray-500 text-sm mb-5">Start your journey by booking a bus ticket</p>
            <button onClick={() => router.push('/routes')} className="btn-primary">
              Find Buses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className={`card transition-all ${booking.status === 'cancelled' ? 'opacity-70' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-semibold">
                        #{booking.bookingId}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'badge-confirmed' :
                        booking.status === 'cancelled' ? 'badge-cancelled' : 'badge-pending'
                      }`}>
                        {booking.status === 'confirmed' ? '✓ ' : booking.status === 'cancelled' ? '✕ ' : '⏳ '}
                        {booking.status}
                      </span>
                      {booking.paymentStatus === 'refunded' && (
                        <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                          Refunded
                        </span>
                      )}
                    </div>

                    {/* Route info */}
                    {booking.route && (
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-center">
                          <div className="font-display font-bold text-gray-900">{formatTime(booking.route.departureTime)}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{booking.route.from}</div>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{booking.route.duration}</div>
                          <div className="w-full h-px bg-gray-200 my-1" />
                        </div>
                        <div className="text-center">
                          <div className="font-display font-bold text-gray-900">{formatTime(booking.route.arrivalTime)}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{booking.route.to}</div>
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {booking.route && (
                        <span className="flex items-center gap-1">
                          📅 {formatDate(booking.route.travelDate)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {booking.passengers?.length} passenger{booking.passengers?.length !== 1 ? 's' : ''}
                        {booking.passengers?.length > 0 && ` (Seats: ${booking.passengers.map((p: { seatNumber: number }) => p.seatNumber).join(', ')})`}
                      </span>
                      {booking.route?.bus && (
                        <span>🚌 {booking.route.bus.busName}</span>
                      )}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                    <div className="text-right">
                      <div className="text-xl font-display font-bold text-gray-900">{formatCurrency(booking.totalFare)}</div>
                      <div className="text-xs text-gray-400 capitalize">{booking.paymentMethod} · {booking.paymentStatus}</div>
                    </div>

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancelling === booking._id}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cancelling === booking._id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Passenger list */}
                {booking.passengers?.length > 0 && (
                  <details className="mt-3 pt-3 border-t border-gray-100">
                    <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-1 select-none">
                      <ChevronRight className="w-3.5 h-3.5" />
                      View passenger details
                    </summary>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {booking.passengers.map((p: { name: string; age: number; gender: string; seatNumber: number }, i: number) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-2 text-xs">
                          <div className="font-semibold text-gray-700">{p.name}</div>
                          <div className="text-gray-400">{p.age} yrs · {p.gender} · Seat {p.seatNumber}</div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
