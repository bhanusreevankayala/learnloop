const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  const { role } = req.query;
  let filter = {};
  if (role) filter.role = role;
  const users = await User.find(filter).select('-password');
  res.json({ success: true, users });
});

router.get('/:id', protect, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
    .populate('enrolledClasses', 'name subject grade coverColor')
    .populate('teachingClasses', 'name subject grade coverColor');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
});

module.exports = router;