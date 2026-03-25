import Link from 'next/link'
import { Clock, Users, Wifi, Zap, Wind, Star, ArrowRight } from 'lucide-react'
import { formatCurrency, formatTime } from '@/lib/utils'

interface RouteCardProps {
  route: {
    _id: string
    from: string
    to: string
    departureTime: string
    arrivalTime: string
    duration: string
    fare: number
    availableSeats: number
    distance: number
    bus: {
      busName: string
      busType: string
      amenities: string[]
      totalSeats: number
    }
  }
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-3 h-3" />,
  'Charging Point': <Zap className="w-3 h-3" />,
  'AC': <Wind className="w-3 h-3" />,
}

const busTypeColors: Record<string, string> = {
  'Volvo AC': 'bg-purple-50 text-purple-700 border-purple-200',
  'AC Sleeper': 'bg-blue-50 text-blue-700 border-blue-200',
  'Non-AC Sleeper': 'bg-gray-50 text-gray-700 border-gray-200',
  'AC Seater': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Non-AC Seater': 'bg-orange-50 text-orange-700 border-orange-200',
}

export default function RouteCard({ route }: RouteCardProps) {
  const occupancy = ((route.bus.totalSeats - route.availableSeats) / route.bus.totalSeats) * 100
  const colorClass = busTypeColors[route.bus.busType] || busTypeColors['AC Seater']

  return (
    <div className="card hover:shadow-md transition-all duration-200 group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Bus info + Times */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold text-gray-800 text-sm">{route.bus.busName}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
              {route.bus.busType}
            </span>
            {route.availableSeats <= 5 && route.availableSeats > 0 && (
              <span className="text-xs font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                Only {route.availableSeats} left!
              </span>
            )}
          </div>

          {/* Time display */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-gray-900">{formatTime(route.departureTime)}</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{route.from}</div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                <Clock className="w-3 h-3" />
                <span>{route.duration}</span>
              </div>
              <div className="relative w-full">
                <div className="h-px bg-gray-200 w-full" />
                <div
                  className="absolute top-0 left-0 h-px bg-brand-400 transition-all duration-500"
                  style={{ width: `${occupancy}%` }}
                />
              </div>
              <div className="text-xs text-gray-400">{route.distance} km</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-display font-bold text-gray-900">{formatTime(route.arrivalTime)}</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{route.to}</div>
            </div>
          </div>

          {/* Amenities */}
          {route.bus.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {route.bus.amenities.slice(0, 4).map((a) => (
                <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">
                  {amenityIcons[a] || <Star className="w-3 h-3" />}
                  {a}
                </span>
              ))}
              {route.bus.amenities.length > 4 && (
                <span className="text-xs text-gray-400">+{route.bus.amenities.length - 4} more</span>
              )}
            </div>
          )}
        </div>

        {/* Right: Fare + Book */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:min-w-[140px]">
          <div className="text-right">
            <div className="text-2xl font-display font-bold text-gray-900">{formatCurrency(route.fare)}</div>
            <div className="text-xs text-gray-400">per person</div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3.5 h-3.5" />
              <span>{route.availableSeats} seats left</span>
            </div>
            {route.availableSeats > 0 ? (
              <Link
                href={`/booking/${route._id}`}
                className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4 group-hover:shadow-md"
              >
                Book Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <button disabled className="btn-primary text-sm py-2 px-4 opacity-50 cursor-not-allowed">
                Sold Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
