import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Bus from '@/models/Bus'
import Route from '@/models/Route'

export async function POST() {
  try {
    await dbConnect()

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@busbook.com' })
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@busbook.com',
        phone: '9999999999',
        password: 'admin123',
        role: 'admin',
      })
    }

    // Create demo user
    const userExists = await User.findOne({ email: 'user@busbook.com' })
    if (!userExists) {
      await User.create({
        name: 'Demo User',
        email: 'user@busbook.com',
        phone: '8888888888',
        password: 'user123',
        role: 'user',
      })
    }

    // Create buses
    const buses = [
      { busName: 'Maharashtra Express', busNumber: 'MH-12-AB-1234', busType: 'Volvo AC', totalSeats: 40, amenities: ['WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'GPS Tracking'] },
      { busName: 'Deccan Queen', busNumber: 'MH-14-CD-5678', busType: 'AC Sleeper', totalSeats: 36, amenities: ['Charging Point', 'Blanket', 'Reading Light', 'GPS Tracking'] },
      { busName: 'Vidarbha Travels', busNumber: 'MH-31-EF-9012', busType: 'Non-AC Seater', totalSeats: 45, amenities: ['GPS Tracking', 'First Aid Kit'] },
      { busName: 'Konkan Cruiser', busNumber: 'MH-06-GH-3456', busType: 'AC Seater', totalSeats: 40, amenities: ['WiFi', 'Charging Point', 'GPS Tracking'] },
      { busName: 'Orange City Express', busNumber: 'MH-40-IJ-7890', busType: 'Volvo AC', totalSeats: 40, amenities: ['WiFi', 'Charging Point', 'Blanket', 'Water Bottle', 'GPS Tracking', 'Entertainment'] },
    ]

    const createdBuses = []
    for (const b of buses) {
      let bus = await Bus.findOne({ busNumber: b.busNumber })
      if (!bus) bus = await Bus.create(b)
      createdBuses.push(bus)
    }

    // Create routes (next 7 days)
    const cities = ['Nagpur', 'Mumbai', 'Pune', 'Nashik', 'Aurangabad', 'Amravati', 'Akola', 'Nanded']
    const routeConfigs = [
      { from: 'Nagpur', to: 'Mumbai', distance: 830, departureTime: '18:00', arrivalTime: '06:00', fare: 950 },
      { from: 'Mumbai', to: 'Nagpur', distance: 830, departureTime: '19:30', arrivalTime: '07:30', fare: 950 },
      { from: 'Nagpur', to: 'Pune', distance: 720, departureTime: '20:00', arrivalTime: '07:00', fare: 850 },
      { from: 'Pune', to: 'Nagpur', distance: 720, departureTime: '19:00', arrivalTime: '06:00', fare: 850 },
      { from: 'Mumbai', to: 'Pune', distance: 150, departureTime: '07:00', arrivalTime: '10:30', fare: 350 },
      { from: 'Pune', to: 'Mumbai', distance: 150, departureTime: '08:00', arrivalTime: '11:30', fare: 350 },
      { from: 'Nagpur', to: 'Amravati', distance: 155, departureTime: '06:00', arrivalTime: '09:00', fare: 220 },
      { from: 'Amravati', to: 'Nagpur', distance: 155, departureTime: '07:00', arrivalTime: '10:00', fare: 220 },
      { from: 'Mumbai', to: 'Nashik', distance: 165, departureTime: '09:00', arrivalTime: '13:00', fare: 300 },
      { from: 'Nashik', to: 'Aurangabad', distance: 195, departureTime: '10:00', arrivalTime: '13:30', fare: 280 },
    ]

    let routesCreated = 0
    for (let day = 0; day <= 14; day++) {
      const travelDate = new Date()
      travelDate.setDate(travelDate.getDate() + day)
      travelDate.setHours(0, 0, 0, 0)

      for (let i = 0; i < routeConfigs.length; i++) {
        const config = routeConfigs[i]
        const bus = createdBuses[i % createdBuses.length]
        const existing = await Route.findOne({ from: config.from, to: config.to, travelDate })
        if (!existing) {
          const depH = parseInt(config.departureTime.split(':')[0])
          const arrH = parseInt(config.arrivalTime.split(':')[0])
          let durationMins = (arrH * 60) - (depH * 60)
          if (durationMins < 0) durationMins += 24 * 60
          const durHrs = Math.floor(durationMins / 60)
          const durMins = durationMins % 60

          await Route.create({
            ...config,
            bus: bus._id,
            duration: `${durHrs}h ${durMins}m`,
            travelDate,
            availableSeats: bus.totalSeats,
            bookedSeats: [],
          })
          routesCreated++
        }
      }
    }

    void cities // just to use the variable

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        buses: createdBuses.length,
        routesCreated,
        adminEmail: 'admin@busbook.com',
        adminPassword: 'admin123',
        userEmail: 'user@busbook.com',
        userPassword: 'user123',
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 })
  }
}
