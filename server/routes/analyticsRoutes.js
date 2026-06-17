const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStudentAnalytics, getClassAnalytics, getSchoolAnalytics } = require('../controllers/analyticsController');

router.get('/student/me', protect, authorize('student'), (req, res, next) => {
  req.params.studentId = req.user._id;
  next();
}, getStudentAnalytics);
router.get('/student/:studentId', protect, authorize('teacher', 'admin'), getStudentAnalytics);
router.get('/class/:classId', protect, authorize('teacher', 'admin'), getClassAnalytics);
router.get('/school', protect, authorize('admin'), getSchoolAnalytics);

module.exports = router;