'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import RouteCard from '@/components/booking/RouteCard'
import { Search, SlidersHorizontal, MapPin, RefreshCw } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const BUS_TYPES = ['All', 'Volvo AC', 'AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Non-AC Seater']

export default function RoutesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(false)
  const [from, setFrom] = useState(searchParams.get('from') || '')
  const [to, setTo] = useState(searchParams.get('to') || '')
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0])
  const [busTypeFilter, setBusTypeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('departureTime')

  const fetchRoutes = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (date) params.set('date', date)
    try {
      const res = await fetch(`/api/routes?${params}`)
      const data = await res.json()
      setRoutes(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [from, to, date])

  useEffect(() => {
    fetchRoutes()
  }, [fetchRoutes])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (date) params.set('date', date)
    router.push(`/routes?${params.toString()}`)
    fetchRoutes()
  }

  const filteredRoutes = routes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => busTypeFilter === 'All' || r.bus?.busType === busTypeFilter)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => {
      if (sortBy === 'fare') return a.fare - b.fare
      if (sortBy === 'duration') return a.duration.localeCompare(b.duration)
      return a.departureTime.localeCompare(b.departureTime)
    })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Search bar */}
      <div className="bg-brand-700 py-5 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-brand-600 border border-brand-500 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="From"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-brand-600 border border-brand-500 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <input
              type="date"
              className="w-full px-3 py-2.5 rounded-xl bg-brand-600 border border-brand-500 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
            />
            <button onClick={handleSearch} className="bg-white text-brand-700 font-semibold rounded-xl py-2.5 px-4 text-sm flex items-center justify-center gap-2 hover:bg-brand-50 transition-colors shadow-sm">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Results header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="font-display font-bold text-gray-900 text-lg">
              {from && to ? `${from} → ${to}` : 'All Routes'}
            </h1>
            <p className="text-sm text-gray-500">
              {date ? formatDate(date) : 'All dates'} · {filteredRoutes.length} bus{filteredRoutes.length !== 1 ? 'es' : ''} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="departureTime">Sort: Departure</option>
              <option value="fare">Sort: Price</option>
              <option value="duration">Sort: Duration</option>
            </select>
          </div>
        </div>

        {/* Bus type filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {BUS_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setBusTypeFilter(type)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                busTypeFilter === type
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-gray-500">Searching for buses...</p>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🚌</div>
            <h3 className="font-display font-semibold text-gray-700 mb-2">No buses found</h3>
            <p className="text-gray-500 text-sm mb-6">
              Try different cities, date, or remove filters
            </p>
            <button onClick={() => { setFrom(''); setTo(''); setBusTypeFilter('All'); fetchRoutes() }}
              className="btn-secondary text-sm">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {filteredRoutes.map((route: any) => (
              <RouteCard key={route._id} route={route} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
