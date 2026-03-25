import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import Bus from '@/models/Bus'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { role?: string } | undefined
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await dbConnect()
    const bus = await Bus.findByIdAndUpdate(params.id, body, { new: true })
    if (!bus) return NextResponse.json({ error: 'Bus not found' }, { status: 404 })
    return NextResponse.json(bus)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update bus' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { role?: string } | undefined
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    await Bus.findByIdAndUpdate(params.id, { isActive: false })
    return NextResponse.json({ message: 'Bus deactivated' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete bus' }, { status: 500 })
  }
}
