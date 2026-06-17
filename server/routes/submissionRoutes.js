const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { submitQuiz, getMySubmissions, getSubmission, getQuizSubmissions, getClassSubmissions } = require('../controllers/submissionController');

router.post('/', protect, authorize('student'), submitQuiz);
router.get('/my', protect, getMySubmissions);
router.get('/quiz/:quizId', protect, authorize('teacher', 'admin'), getQuizSubmissions);
router.get('/class/:classId', protect, authorize('teacher', 'admin'), getClassSubmissions);
router.get('/:id', protect, getSubmission);

module.exports = router;