'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/layout/Navbar'
import SeatMap from '@/components/booking/SeatMap'
import { formatCurrency, formatTime, formatDate } from '@/lib/utils'
import { Plus, Minus, CheckCircle, ArrowLeft, Bus, Clock, MapPin, Users, CreditCard } from 'lucide-react'

interface Passenger {
  name: string
  age: string
  gender: string
  seatNumber: number
}

export default function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session, status } = useSession()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [route, setRoute] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [submitting, setSubmitting] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/booking/${id}`)
    }
  }, [status, router, id])

  useEffect(() => {
    fetch(`/api/routes/${id}`)
      .then((r) => r.json())
      .then((d) => { setRoute(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleSeatToggle = (seat: number) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    )
  }

  const handleProceedToPassengers = () => {
    if (!selectedSeats.length) return
    const sorted = [...selectedSeats].sort((a, b) => a - b)
    setPassengers(
      sorted.map((seat) => ({
        name: '',
        age: '',
        gender: 'Male',
        seatNumber: seat,
      }))
    )
    setStep(2)
  }

  const updatePassenger = (idx: number, field: string, value: string) => {
    setPassengers((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)))
  }

  const handleProceedToPayment = () => {
    const valid = passengers.every((p) => p.name.trim() && p.age && parseInt(p.age) > 0)
    if (!valid) { alert('Please fill in all passenger details'); return }
    setStep(3)
  }

  const handleConfirmBooking = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: id,
          passengers: passengers.map((p) => ({ ...p, age: parseInt(p.age) })),
          paymentMethod,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBooking(data)
      setStep(4)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading route details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Route not found</p>
            <button onClick={() => router.back()} className="btn-secondary">Go back</button>
          </div>
        </div>
      </div>
    )
  }

  // Success screen
  if (step === 4 && booking) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full card text-center animate-slide-up">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">Booking Confirmed!</h1>
            <p className="text-gray-500 text-sm mb-6">Your tickets have been booked successfully</p>

            <div className="bg-brand-50 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Booking ID</span>
                <span className="font-bold text-brand-700 font-mono">{booking.bookingId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Route</span>
                <span className="font-medium">{route.from} → {route.to}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{formatDate(route.travelDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Seats</span>
                <span className="font-medium">{booking.passengers.map((p: Passenger) => p.seatNumber).join(', ')}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-brand-100 pt-2">
                <span className="font-semibold text-gray-700">Total Paid</span>
                <span className="font-bold text-brand-700">{formatCurrency(booking.totalFare)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => router.push('/bookings')} className="btn-primary flex-1">
                View My Bookings
              </button>
              <button onClick={() => router.push('/')} className="btn-secondary flex-1">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalFare = route.fare * selectedSeats.length

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {step > 1 ? 'Back' : 'Back to results'}
        </button>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { n: 1, label: 'Select Seats' },
            { n: 2, label: 'Passengers' },
            { n: 3, label: 'Payment' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${step >= s.n ? 'text-brand-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  step > s.n ? 'bg-brand-600 border-brand-600 text-white' :
                  step === s.n ? 'border-brand-600 text-brand-600' :
                  'border-gray-200 text-gray-400'
                }`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px w-8 ${step > s.n ? 'bg-brand-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Route info card */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                  <Bus className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{route.bus?.busName}</p>
                  <p className="text-xs text-gray-400">{route.bus?.busType}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xl font-display font-bold">{formatTime(route.departureTime)}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{route.from}</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{route.duration}</div>
                  <div className="w-full h-px bg-gray-200 my-1" />
                  <div className="text-xs text-gray-400">{formatDate(route.travelDate)}</div>
                </div>
                <div>
                  <div className="text-xl font-display font-bold">{formatTime(route.arrivalTime)}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{route.to}</div>
                </div>
              </div>
            </div>

            {/* Step 1: Seat Selection */}
            {step === 1 && (
              <div className="card">
                <h2 className="font-display font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-500" /> Select Your Seats
                </h2>
                <SeatMap
                  totalSeats={route.bus?.totalSeats || 40}
                  bookedSeats={route.bookedSeats || []}
                  selectedSeats={selectedSeats}
                  onSeatToggle={handleSeatToggle}
                  maxSelectable={6}
                />
                <button
                  onClick={handleProceedToPassengers}
                  disabled={!selectedSeats.length}
                  className="btn-primary w-full mt-5"
                >
                  Continue with {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}
                </button>
              </div>
            )}

            {/* Step 2: Passenger details */}
            {step === 2 && (
              <div className="card">
                <h2 className="font-display font-semibold text-gray-800 mb-4">Passenger Details</h2>
                <div className="space-y-4">
                  {passengers.map((p, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="font-medium text-sm text-gray-700">Seat {p.seatNumber}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="label">Full Name *</label>
                          <input
                            className="input-field"
                            placeholder="Passenger name"
                            value={p.name}
                            onChange={(e) => updatePassenger(i, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label">Age *</label>
                          <input
                            type="number"
                            className="input-field"
                            placeholder="Age"
                            min="1"
                            max="120"
                            value={p.age}
                            onChange={(e) => updatePassenger(i, 'age', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label">Gender</label>
                          <select
                            className="input-field"
                            value={p.gender}
                            onChange={(e) => updatePassenger(i, 'gender', e.target.value)}
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handleProceedToPayment} className="btn-primary w-full mt-5">
                  Proceed to Payment
                </button>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="card">
                <h2 className="font-display font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-500" /> Payment
                </h2>

                <div className="space-y-3 mb-6">
                  {[
                    { value: 'online', label: 'Online Payment', desc: 'UPI, Cards, Net Banking', icon: '💳' },
                    { value: 'cash', label: 'Cash on Board', desc: 'Pay the driver directly', icon: '💵' },
                  ].map((m) => (
                    <label
                      key={m.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === m.value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        className="hidden"
                        value={m.value}
                        checked={paymentMethod === m.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="text-xl">{m.icon}</span>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{m.label}</p>
                        <p className="text-xs text-gray-500">{m.desc}</p>
                      </div>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === m.value ? 'border-brand-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === m.value && <div className="w-2.5 h-2.5 bg-brand-500 rounded-full" />}
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleConfirmBooking}
                  disabled={submitting}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" />Confirm Booking · {formatCurrency(totalFare)}</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Booking summary */}
          <div className="space-y-4">
            <div className="card sticky top-20">
              <h3 className="font-display font-semibold text-gray-800 mb-4">Booking Summary</h3>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Route</span>
                  <span className="font-medium">{route.from} → {route.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{formatDate(route.travelDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Departure</span>
                  <span className="font-medium">{formatTime(route.departureTime)}</span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Seats</span>
                    <span className="font-medium">{selectedSeats.sort((a, b) => a - b).join(', ')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Fare/seat</span>
                  <span className="font-medium">{formatCurrency(route.fare)}</span>
                </div>
                {selectedSeats.length > 1 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Passengers</span>
                    <div className="flex items-center gap-1">
                      <Minus className="w-3 h-3 text-gray-400" />
                      <span className="font-medium">{selectedSeats.length}</span>
                      <Plus className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>

              {selectedSeats.length > 0 && (
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="text-xl font-display font-bold text-brand-600">{formatCurrency(totalFare)}</span>
                </div>
              )}

              {step === 1 && selectedSeats.length === 0 && (
                <p className="text-xs text-gray-400 text-center mt-2">Select seats to see total</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
