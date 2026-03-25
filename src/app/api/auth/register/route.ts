import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json()

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    await dbConnect()

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const user = await User.create({ name, email, phone, password })

    return NextResponse.json(
      { message: 'Account created successfully', userId: user._id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
