'use client'
import { useState } from 'react'

interface SeatMapProps {
  totalSeats: number
  bookedSeats: number[]
  selectedSeats: number[]
  onSeatToggle: (seat: number) => void
  maxSelectable?: number
}

export default function SeatMap({
  totalSeats,
  bookedSeats,
  selectedSeats,
  onSeatToggle,
  maxSelectable = 6,
}: SeatMapProps) {
  const rows = Math.ceil(totalSeats / 4)

  const getSeatStatus = (seat: number) => {
    if (bookedSeats.includes(seat)) return 'booked'
    if (selectedSeats.includes(seat)) return 'selected'
    return 'available'
  }

  const handleClick = (seat: number) => {
    if (bookedSeats.includes(seat)) return
    if (!selectedSeats.includes(seat) && selectedSeats.length >= maxSelectable) return
    onSeatToggle(seat)
  }

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-5 text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-200" />
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-brand-500 border-2 border-brand-600" />
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-gray-200 border-2 border-gray-300" />
          <span className="text-gray-600">Booked</span>
        </div>
      </div>

      {/* Bus front indicator */}
      <div className="flex items-center justify-center mb-4">
        <div className="bg-brand-600 text-white text-xs font-bold px-6 py-1.5 rounded-full">
          🚌 FRONT
        </div>
      </div>

      {/* Seats grid */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <div className="space-y-2">
          {Array.from({ length: rows }, (_, rowIdx) => {
            const leftA = rowIdx * 4 + 1
            const leftB = rowIdx * 4 + 2
            const rightC = rowIdx * 4 + 3
            const rightD = rowIdx * 4 + 4

            return (
              <div key={rowIdx} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-6 text-center font-mono">{rowIdx + 1}</span>
                <div className="flex gap-1.5 flex-1">
                  {/* Left side */}
                  {[leftA, leftB].map((seat) =>
                    seat <= totalSeats ? (
                      <SeatButton key={seat} seat={seat} status={getSeatStatus(seat)} onClick={handleClick} />
                    ) : (
                      <div key={seat} className="w-9 h-9" />
                    )
                  )}

                  {/* Aisle */}
                  <div className="w-6" />

                  {/* Right side */}
                  {[rightC, rightD].map((seat) =>
                    seat <= totalSeats ? (
                      <SeatButton key={seat} seat={seat} status={getSeatStatus(seat)} onClick={handleClick} />
                    ) : (
                      <div key={seat} className="w-9 h-9" />
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        {selectedSeats.length > 0
          ? `${selectedSeats.length} seat(s) selected: ${selectedSeats.sort((a, b) => a - b).join(', ')}`
          : 'Click on available seats to select'}
      </div>
    </div>
  )
}

function SeatButton({
  seat,
  status,
  onClick,
}: {
  seat: number
  status: 'available' | 'selected' | 'booked'
  onClick: (seat: number) => void
}) {
  const classes = {
    available: 'seat-available',
    selected: 'seat-selected',
    booked: 'seat-booked',
  }

  return (
    <button
      onClick={() => onClick(seat)}
      disabled={status === 'booked'}
      className={`w-9 h-9 text-xs font-bold rounded-lg transition-all duration-150 ${classes[status]}`}
      title={`Seat ${seat} - ${status}`}
    >
      {seat}
    </button>
  )
}
