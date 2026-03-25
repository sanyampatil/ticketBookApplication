import mongoose, { Document, Schema } from 'mongoose'

export interface IPassenger {
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  seatNumber: number
}

export interface IBooking extends Document {
  bookingId: string
  user: mongoose.Types.ObjectId
  route: mongoose.Types.ObjectId
  passengers: IPassenger[]
  totalFare: number
  status: 'confirmed' | 'cancelled' | 'pending'
  paymentStatus: 'paid' | 'pending' | 'refunded'
  paymentMethod: 'online' | 'cash'
  bookedAt: Date
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PassengerSchema = new Schema<IPassenger>({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  seatNumber: { type: Number, required: true },
})

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    route: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
    passengers: [PassengerSchema],
    totalFare: { type: Number, required: true },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'refunded'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cash'],
      default: 'online',
    },
    bookedAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)
