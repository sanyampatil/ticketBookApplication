import mongoose, { Document, Schema } from 'mongoose'

export interface IBus extends Document {
  busName: string
  busNumber: string
  busType: 'AC Sleeper' | 'Non-AC Sleeper' | 'AC Seater' | 'Non-AC Seater' | 'Volvo AC'
  totalSeats: number
  amenities: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BusSchema = new Schema<IBus>(
  {
    busName: { type: String, required: true, trim: true },
    busNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    busType: {
      type: String,
      required: true,
      enum: ['AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Non-AC Seater', 'Volvo AC'],
    },
    totalSeats: { type: Number, required: true, min: 1 },
    amenities: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Bus || mongoose.model<IBus>('Bus', BusSchema)
