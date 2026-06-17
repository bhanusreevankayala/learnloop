// classRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createClass, getClasses, getClass, updateClass, joinClass, removeStudent, deleteClass } = require('../controllers/classController');

router.post('/', protect, authorize('teacher', 'admin'), createClass);
router.get('/', protect, getClasses);
router.post('/join', protect, authorize('student'), joinClass);
router.get('/:id', protect, getClass);
router.put('/:id', protect, authorize('teacher', 'admin'), updateClass);
router.delete('/:id/students/:studentId', protect, authorize('teacher', 'admin'), removeStudent);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteClass);

module.exports = router;