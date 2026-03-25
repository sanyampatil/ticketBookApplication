'use client'
import { useEffect, useState, useCallback } from 'react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { Search, XCircle, RefreshCw } from 'lucide-react'

interface BookingRow {
  _id: string
  bookingId: string
  status: string
  paymentStatus: string
  paymentMethod: string
  totalFare: number
  createdAt: string
  passengers: { name: string; age: number; gender: string; seatNumber: number }[]
  user: { name: string; email: string; phone: string }
  route: {
    from: string; to: string; departureTime: string; arrivalTime: string
    travelDate: string; duration: string; bus: { busName: string }
  }
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/bookings?page=${page}&limit=20`)
      const d = await r.json()
      setBookings(d.bookings || [])
      setTotalPages(d.pages || 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(id)
    try {
      await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      setBookings((p) => p.map((b) => b._id === id ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b))
    } catch (e) {
      alert('Failed to cancel')
    } finally {
      setCancelling(null)
    }
  }

  const filtered = bookings.filter((b) => {
    const matchesSearch = !search ||
      b.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.route?.from?.toLowerCase().includes(search.toLowerCase()) ||
      b.route?.to?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} bookings shown</p>
        </div>
        <button onClick={fetchBookings} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Search bookings, users, routes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400">No bookings found</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Booking ID', 'Passenger', 'Route', 'Date', 'Seats', 'Amount', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-semibold">
                        {b.bookingId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 text-xs">{b.user?.name}</div>
                      <div className="text-gray-400 text-xs truncate max-w-32">{b.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-700 text-xs">{b.route?.from} → {b.route?.to}</div>
                      <div className="text-gray-400 text-xs">{b.route?.bus?.busName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                      {b.route ? formatDate(b.route.travelDate) : '-'}
                      {b.route && <div className="text-gray-400">{formatTime(b.route.departureTime)}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {b.passengers?.map((p) => p.seatNumber).join(', ')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 text-xs whitespace-nowrap">
                      {formatCurrency(b.totalFare)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        b.status === 'confirmed' ? 'badge-confirmed' :
                        b.status === 'cancelled' ? 'badge-cancelled' : 'badge-pending'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(b._id)}
                          disabled={cancelling === b._id}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {cancelling === b._id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
