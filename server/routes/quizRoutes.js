const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createQuiz, publishQuiz, getQuizzes, getQuiz, updateQuiz, deleteQuiz, closeQuiz } = require('../controllers/quizController');

router.post('/', protect, authorize('teacher', 'admin'), createQuiz);
router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuiz);
router.put('/:id', protect, authorize('teacher', 'admin'), updateQuiz);
router.put('/:id/publish', protect, authorize('teacher', 'admin'), publishQuiz);
router.put('/:id/close', protect, authorize('teacher', 'admin'), closeQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);

module.exports = router;