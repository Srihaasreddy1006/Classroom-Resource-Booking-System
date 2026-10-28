const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      required: [true, 'Resource ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Resource category is required'],
      enum: {
        values: [
          'Projectors',
          'Smart boards',
          'Computers',
          'Whiteboards',
          'Speakers and microphones',
          'Wi-Fi facilities',
          'Portable presentation equipment',
          'Laboratory equipment'
        ],
        message: 'Invalid resource category'
      }
    },
    type: {
      type: String,
      required: [true, 'Resource type is required (installed or portable)'],
      enum: ['installed', 'portable'],
      default: 'portable'
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Total quantity is required'],
      min: [0, 'Total quantity cannot be negative']
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative']
    },
    status: {
      type: String,
      enum: ['available', 'maintenance', 'retired'],
      default: 'available'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    specifications: {
      type: Map,
      of: String,
      default: {}
    },
    installedIn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      default: null
    }
  },
  {
    timestamps: true
  }
);

resourceSchema.index({ category: 1, type: 1, status: 1 });

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
