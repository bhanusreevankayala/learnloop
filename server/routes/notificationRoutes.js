const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getMyNotifications, markAsRead, markAllAsRead, sendAnnouncement, deleteNotification } = require('../controllers/notificationController');

router.get('/', protect, getMyNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.post('/announce', protect, authorize('teacher', 'admin'), sendAnnouncement);
router.delete('/:id', protect, deleteNotification);

module.exports = router;