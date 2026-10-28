const express = require('express');
const router = express.Router();
const { getAllUsers, toggleUserStatus } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
