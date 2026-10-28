const express = require('express');
const router = express.Router();
const {
  getAllClassrooms,
  getClassroomById,
  getClassroomSchedule,
  createClassroom,
  updateClassroom,
  deleteClassroom
} = require('../controllers/classroomController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', getAllClassrooms);
router.get('/:id', getClassroomById);
router.get('/:id/schedule', getClassroomSchedule);

// Admin-only management endpoints
router.post('/', protect, authorize('admin'), createClassroom);
router.put('/:id', protect, authorize('admin'), updateClassroom);
router.delete('/:id', protect, authorize('admin'), deleteClassroom);

module.exports = router;
