import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Route from '@/models/Route'

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const date = searchParams.get('date')

    const query: Record<string, unknown> = { isActive: true }
    if (from) query.from = new RegExp(from, 'i')
    if (to) query.to = new RegExp(to, 'i')
    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      query.travelDate = { $gte: start, $lte: end }
    }

    const routes = await Route.find(query).populate('bus').sort({ departureTime: 1 })
    return NextResponse.json(routes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { role?: string } | undefined
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await dbConnect()
    const route = await Route.create({ ...body, availableSeats: body.totalSeats || 40, bookedSeats: [] })
    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create route' }, { status: 500 })
  }
}
