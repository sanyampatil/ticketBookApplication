import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import RouteModel from '@/models/Route'
import Bus from '@/models/Bus'
import User from '@/models/User'

export async function GET() {
  try {
    // ✅ Get session (no authOptions)
    const session = await getServerSession()

    const user = session?.user as { role?: string } | undefined

    // ✅ Role check
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRoutes,
      totalBuses,
      totalUsers,
      revenueData,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      RouteModel.countDocuments({ isActive: true }),
      Bus.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'user' }),
      Booking.aggregate([
        { $match: { status: 'confirmed', paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalFare' } } },
      ]),
    ])

    const totalRevenue = revenueData[0]?.total || 0

    // ✅ Last 7 days stats
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalFare' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return NextResponse.json({
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRoutes,
      totalBuses,
      totalUsers,
      totalRevenue,
      recentBookings,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}