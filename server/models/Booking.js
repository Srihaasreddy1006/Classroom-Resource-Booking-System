const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: [true, 'Classroom reference is required']
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Reservation date is required'],
      trim: true
    },
    startTime: {
      type: String, // Format: HH:MM (24-hour)
      required: [true, 'Start time is required'],
      trim: true
    },
    endTime: {
      type: String, // Format: HH:MM (24-hour)
      required: [true, 'End time is required'],
      trim: true
    },
    purpose: {
      type: String,
      required: [true, 'Booking purpose is required'],
      trim: true,
      minlength: [5, 'Purpose must be at least 5 characters'],
      maxlength: [500, 'Purpose cannot exceed 500 characters']
    },
    attendees: {
      type: Number,
      required: [true, 'Expected attendee count is required'],
      min: [1, 'Attendees must be at least 1']
    },
    additionalEquipment: [
      {
        resource: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Resource'
        },
        resourceName: String,
        quantity: {
          type: Number,
          default: 1,
          min: 1
        }
      }
    ],
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'],
      default: 'Pending'
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true
    },
    cancellationReason: {
      type: String,
      default: null,
      trim: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ classroom: 1, date: 1, status: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ date: 1, startTime: 1, endTime: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
