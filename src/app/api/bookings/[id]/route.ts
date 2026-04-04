import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import Route from '@/models/Route'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await dbConnect()
    const booking = await Booking.findById(params.id)
      .populate({ path: 'route', populate: { path: 'bus' } })
      .populate('user', 'name email phone')

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const u = session.user as { id: string; role: string }
    if (u.role !== 'admin' && booking.user._id.toString() !== u.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action } = await req.json()
    await dbConnect()

    const booking = await Booking.findById(params.id)
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const u = session.user as { id: string; role: string }
    if (u.role !== 'admin' && booking.user.toString() !== u.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (action === 'cancel') {
      if (booking.status === 'cancelled') {
        return NextResponse.json({ error: 'Already cancelled' }, { status: 400 })
      }

      const seatNums = booking.passengers.map((p: { seatNumber: number }) => p.seatNumber)
      await Route.findByIdAndUpdate(booking.route, {
        $pull: { bookedSeats: { $in: seatNums } },
        $inc: { availableSeats: booking.passengers.length },
      })

      booking.status = 'cancelled'
      booking.paymentStatus = 'refunded'
      booking.cancelledAt = new Date()
      await booking.save()
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
