'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Search, ArrowRight, Shield, Clock, Star, MapPin, Bus, Users, Ticket, TrendingUp } from 'lucide-react'

const POPULAR_CITIES = ['Nagpur', 'Mumbai', 'Pune', 'Nashik', 'Aurangabad', 'Amravati', 'Akola', 'Nanded']

const POPULAR_ROUTES = [
  { from: 'Nagpur', to: 'Mumbai', fare: '₹950', duration: '12h', buses: 5 },
  { from: 'Mumbai', to: 'Pune', fare: '₹350', duration: '3.5h', buses: 8 },
  { from: 'Nagpur', to: 'Pune', fare: '₹850', duration: '11h', buses: 3 },
  { from: 'Nashik', to: 'Aurangabad', fare: '₹280', duration: '3.5h', buses: 4 },
]

const STATS = [
  { icon: Bus, label: 'Buses Available', value: '50+' },
  { icon: MapPin, label: 'Routes Covered', value: '120+' },
  { icon: Users, label: 'Happy Travellers', value: '10K+' },
  { icon: Ticket, label: 'Tickets Booked', value: '25K+' },
]

export default function HomePage() {
  const router = useRouter()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [fromSugg, setFromSugg] = useState<string[]>([])
  const [toSugg, setToSugg] = useState<string[]>([])

  const handleFromChange = (v: string) => {
    setFrom(v)
    setFromSugg(v ? POPULAR_CITIES.filter(c => c.toLowerCase().startsWith(v.toLowerCase())) : [])
  }
  const handleToChange = (v: string) => {
    setTo(v)
    setToSugg(v ? POPULAR_CITIES.filter(c => c.toLowerCase().startsWith(v.toLowerCase())) : [])
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (date) params.set('date', date)
    router.push(`/routes?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-brand-300 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-brand-600/50 border border-brand-500/50 rounded-full px-4 py-1.5 text-brand-100 text-sm font-medium mb-6">
              <TrendingUp className="w-3.5 h-3.5" />
              Maharashtra&apos;s Most Trusted Bus Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight mb-4">
              Travel Smarter,<br />
              <span className="text-brand-300">Book Faster</span>
            </h1>
            <p className="text-brand-200 text-lg md:text-xl max-w-2xl mx-auto">
              Find and book bus tickets across Maharashtra instantly. Comfortable journeys, guaranteed.
            </p>
          </div>

          {/* Search Card */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* From */}
              <div className="relative">
                <label className="label">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className="input-field pl-9"
                    placeholder="Origin city"
                    value={from}
                    onChange={(e) => handleFromChange(e.target.value)}
                    onBlur={() => setTimeout(() => setFromSugg([]), 200)}
                  />
                  {fromSugg.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      {fromSugg.map((c) => (
                        <button key={c} onMouseDown={() => { setFrom(c); setFromSugg([]) }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-50 hover:text-brand-700 transition-colors">
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* To */}
              <div className="relative">
                <label className="label">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className="input-field pl-9"
                    placeholder="Destination city"
                    value={to}
                    onChange={(e) => handleToChange(e.target.value)}
                    onBlur={() => setTimeout(() => setToSugg([]), 200)}
                  />
                  {toSugg.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      {toSugg.map((c) => (
                        <button key={c} onMouseDown={() => { setTo(c); setToSugg([]) }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand-50 hover:text-brand-700 transition-colors">
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="label">Travel Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Search btn */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
                >
                  <Search className="w-4 h-4" />
                  Search Buses
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-brand-50 rounded-xl mb-3">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <div className="text-2xl font-display font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900">Popular Routes</h2>
            <p className="text-gray-500 text-sm mt-1">Most booked routes this week</p>
          </div>
          <a href="/routes" className="text-brand-600 text-sm font-medium hover:text-brand-700 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_ROUTES.map((r) => (
            <button
              key={`${r.from}-${r.to}`}
              onClick={() => router.push(`/routes?from=${r.from}&to=${r.to}&date=${date}`)}
              className="group p-5 bg-white border border-gray-100 rounded-2xl hover:border-brand-200 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-brand-500" />
                <span className="text-sm font-semibold text-gray-700">{r.from}</span>
              </div>
              <div className="ml-3 border-l-2 border-dashed border-gray-200 pl-3 py-1 text-xs text-gray-400 mb-3">
                {r.duration} · {r.buses} buses
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-500" />
                <span className="text-sm font-semibold text-gray-700">{r.to}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-display font-bold text-brand-600">{r.fare}</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-display font-bold text-gray-900">Why Choose BusBook?</h2>
            <p className="text-gray-500 mt-2">Everything you need for a smooth journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                color: 'bg-emerald-50 text-emerald-600',
                title: 'Secure Booking',
                desc: 'Your payment and personal information are always protected with industry-standard encryption.',
              },
              {
                icon: Clock,
                color: 'bg-brand-50 text-brand-600',
                title: 'Instant Confirmation',
                desc: 'Get your ticket confirmation and booking details instantly after payment.',
              },
              {
                icon: Star,
                color: 'bg-amber-50 text-amber-600',
                title: 'Seat Selection',
                desc: 'Choose your preferred seat from a visual seat map before confirming your booking.',
              },
            ].map((f) => (
              <div key={f.title} className="card hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
