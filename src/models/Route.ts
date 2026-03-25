import mongoose, { Document, Schema } from 'mongoose'

export interface IRoute extends Document {
  from: string
  to: string
  distance: number
  duration: string
  departureTime: string
  arrivalTime: string
  bus: mongoose.Types.ObjectId
  fare: number
  availableSeats: number
  bookedSeats: number[]
  travelDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const RouteSchema = new Schema<IRoute>(
  {
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    distance: { type: Number, required: true },
    duration: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    bus: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
    fare: { type: Number, required: true, min: 0 },
    availableSeats: { type: Number, required: true },
    bookedSeats: [{ type: Number }],
    travelDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

RouteSchema.index({ from: 1, to: 1, travelDate: 1 })

export default mongoose.models.Route || mongoose.model<IRoute>('Route', RouteSchema)
