'use client'
import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import {
  Ticket, Bus, Map, Users, TrendingUp, CheckCircle, XCircle, DollarSign, RefreshCw
} from 'lucide-react'

interface Stats {
  totalBookings: number
  confirmedBookings: number
  cancelledBookings: number
  totalRoutes: number
  totalBuses: number
  totalUsers: number
  totalRevenue: number
  recentBookings: { _id: string; count: number; revenue: number }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) return <div className="text-gray-500">Failed to load stats</div>

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', change: '+12%' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Ticket, color: 'bg-brand-50 text-brand-600', change: '+8%' },
    { label: 'Active Routes', value: stats.totalRoutes, icon: Map, color: 'bg-purple-50 text-purple-600', change: '+2' },
    { label: 'Registered Users', value: stats.totalUsers, icon: Users, color: 'bg-orange-50 text-orange-600', change: '+24' },
  ]

  const maxCount = Math.max(...(stats.recentBookings?.map((b) => b.count) || [1]))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of BusBook operations</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                <c.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {c.change}
              </span>
            </div>
            <div className="text-2xl font-display font-bold text-gray-900">{c.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-gray-800">Bookings (Last 7 Days)</h2>
            <TrendingUp className="w-4 h-4 text-brand-500" />
          </div>
          {stats.recentBookings?.length > 0 ? (
            <div className="flex items-end gap-2 h-32">
              {stats.recentBookings.map((b) => (
                <div key={b._id} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-400 font-mono">{b.count}</div>
                  <div
                    className="w-full bg-brand-500 rounded-t-lg transition-all hover:bg-brand-600"
                    style={{ height: `${(b.count / maxCount) * 100}px`, minHeight: '4px' }}
                    title={`${b._id}: ${b.count} bookings`}
                  />
                  <div className="text-xs text-gray-400 truncate w-full text-center">
                    {new Date(b._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
              No booking data yet
            </div>
          )}
        </div>

        {/* Booking status breakdown */}
        <div className="card">
          <h2 className="font-display font-semibold text-gray-800 mb-4">Booking Status</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-gray-600">Confirmed</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{stats.confirmedBookings}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: stats.totalBookings ? `${(stats.confirmedBookings / stats.totalBookings) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-gray-600">Cancelled</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{stats.cancelledBookings}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full transition-all duration-700"
                  style={{ width: stats.totalBookings ? `${(stats.cancelledBookings / stats.totalBookings) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Buses Active</span>
                <span className="font-semibold text-gray-800">{stats.totalBuses}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Active Routes</span>
                <span className="font-semibold text-gray-800">{stats.totalRoutes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="font-display font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/buses', label: 'Add Bus', icon: Bus, color: 'bg-brand-50 text-brand-600 hover:bg-brand-100' },
            { href: '/admin/routes', label: 'Add Route', icon: Map, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
            { href: '/admin/bookings', label: 'All Bookings', icon: Ticket, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
            {
              href: '#', label: 'Seed Data', icon: RefreshCw, color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
              onClick: async () => {
                if (!confirm('Seed the database with demo data?')) return
                const r = await fetch('/api/seed', { method: 'POST' })
                const d = await r.json()
                alert(d.message || 'Done!')
              }
            },
          ].map((a) => (
            a.onClick ? (
              <button
                key={a.label}
                onClick={a.onClick}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors text-center ${a.color}`}
              >
                <a.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{a.label}</span>
              </button>
            ) : (
              <a
                key={a.label}
                href={a.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors text-center ${a.color}`}
              >
                <a.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{a.label}</span>
              </a>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
