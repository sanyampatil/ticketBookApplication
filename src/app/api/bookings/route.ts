import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import Route from '@/models/Route'
import { generateBookingId } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const u = session.user as { id: string; role: string }
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const query = u.role === 'admin' ? {} : { user: u.id }
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate({ path: 'route', populate: { path: 'bus' } })
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ])

    return NextResponse.json({ bookings, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const u = session.user as { id: string }
    const { routeId, passengers, paymentMethod } = await req.json()

    if (!routeId || !passengers?.length) {
      return NextResponse.json({ error: 'Route and passengers are required' }, { status: 400 })
    }

    await dbConnect()
    const route = await Route.findById(routeId)
    if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 })

    const seatNumbers = passengers.map((p: { seatNumber: number }) => p.seatNumber)
    const conflict = seatNumbers.some((s: number) => route.bookedSeats.includes(s))
    if (conflict) return NextResponse.json({ error: 'One or more seats already booked' }, { status: 400 })

    if (route.availableSeats < passengers.length) {
      return NextResponse.json({ error: 'Not enough seats available' }, { status: 400 })
    }

    const totalFare = route.fare * passengers.length

    const booking = await Booking.create({
      bookingId: generateBookingId(),
      user: u.id,
      route: routeId,
      passengers,
      totalFare,
      paymentMethod: paymentMethod || 'online',
      status: 'confirmed',
      paymentStatus: 'paid',
    })

    // Update route seats
    await Route.findByIdAndUpdate(routeId, {
      $push: { bookedSeats: { $each: seatNumbers } },
      $inc: { availableSeats: -passengers.length },
    })

    const populated = await Booking.findById(booking._id)
      .populate({ path: 'route', populate: { path: 'bus' } })
      .populate('user', 'name email phone')

    return NextResponse.json(populated, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
