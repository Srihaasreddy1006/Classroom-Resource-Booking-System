const express = require('express');
const router = express.Router();
const { getDashboardStats, getAuditLogs, getExportReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/audit-logs', protect, authorize('admin'), getAuditLogs);
router.get('/export', protect, authorize('admin'), getExportReport);

module.exports = router;
