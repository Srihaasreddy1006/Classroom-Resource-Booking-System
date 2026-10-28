const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema(
  {
    classroomId: {
      type: String,
      required: [true, 'Classroom ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Classroom name is required (e.g. Classroom A)'],
      trim: true
    },
    building: {
      type: String,
      required: [true, 'Building name is required'],
      trim: true
    },
    floor: {
      type: String,
      required: [true, 'Floor information is required'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: [5, 'Capacity must be at least 5'],
      max: [1000, 'Capacity cannot exceed 1000']
    },
    type: {
      type: String,
      required: [true, 'Classroom type is required'],
      enum: {
        values: [
          'Standard classroom',
          'Smart classroom',
          'Seminar hall',
          'Computer laboratory',
          'Conference room'
        ],
        message: 'Invalid classroom type'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    facilities: {
      type: [String],
      default: []
    },
    installedEquipment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
      }
    ],
    status: {
      type: String,
      enum: ['active', 'maintenance', 'inactive'],
      default: 'active'
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

classroomSchema.index({ building: 1, floor: 1 });
classroomSchema.index({ type: 1, capacity: 1 });
classroomSchema.index({ status: 1 });

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
