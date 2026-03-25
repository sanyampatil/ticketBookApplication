import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import Bus from '@/models/Bus'

export async function GET() {
  try {
    await dbConnect()
    const buses = await Bus.find({ isActive: true }).sort({ createdAt: -1 })
    return NextResponse.json(buses)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch buses' }, { status: 500 })
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
    const bus = await Bus.create(body)
    return NextResponse.json(bus, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create bus' }, { status: 500 })
  }
}
