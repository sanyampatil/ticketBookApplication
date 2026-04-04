import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Route from '@/models/Route'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const route = await Route.findById(params.id).populate('bus')
    if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    return NextResponse.json(route)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch route' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as { role?: string } | undefined
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    await dbConnect()
    const route = await Route.findByIdAndUpdate(params.id, body, { new: true })
    if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    return NextResponse.json(route)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 })
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
    await Route.findByIdAndUpdate(params.id, { isActive: false })
    return NextResponse.json({ message: 'Route deactivated' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 })
  }
}
