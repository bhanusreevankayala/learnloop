const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

exports.submitQuiz = async (req, res) => {
  const { quizId, answers, timeTaken } = req.body;

  const quiz = await Quiz.findById(quizId).populate('class');
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
  if (quiz.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Quiz is not accepting submissions' });
  }

  // Check attempt limit
  const existingAttempts = await Submission.countDocuments({ quiz: quizId, student: req.user._id });
  if (existingAttempts >= quiz.maxAttempts) {
    return res.status(400).json({ success: false, message: `Maximum ${quiz.maxAttempts} attempt(s) allowed` });
  }

  // Score the answers
  const scoredAnswers = quiz.questions.map((question, idx) => {
    const studentAnswer = answers.find(a => a.questionIndex === idx);
    const selectedAnswer = studentAnswer ? studentAnswer.selectedAnswer : null;
    const isCorrect = selectedAnswer === question.correctAnswer;
    return {
      questionId: question._id,
      question: question.question,
      topic: question.topic,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      points: isCorrect ? question.points : 0,
      maxPoints: question.points,
    };
  });

  const submission = await Submission.create({
    quiz: quizId,
    student: req.user._id,
    class: quiz.class._id,
    answers: scoredAnswers,
    timeTaken,
    attemptNumber: existingAttempts + 1,
    passed: false, // will be set after save
  });

  // Set passed
  submission.passed = submission.percentage >= quiz.passingScore;
  await submission.save();

  // Update quiz submissions
  await Quiz.findByIdAndUpdate(quizId, { $push: { submissions: submission._id } });

  // Update student average score
  const allSubmissions = await Submission.find({ student: req.user._id });
  const avgScore = allSubmissions.reduce((sum, s) => sum + s.percentage, 0) / allSubmissions.length;
  await User.findByIdAndUpdate(req.user._id, {
    averageScore: Math.round(avgScore),
    totalQuizzesTaken: allSubmissions.length,
  });

  // Populate for response
  await submission.populate('quiz', 'title subject allowReview questions passingScore');

  res.status(201).json({ success: true, submission });
};

exports.getMySubmissions = async (req, res) => {
  const { quizId, classId } = req.query;
  let filter = { student: req.user._id };
  if (quizId) filter.quiz = quizId;
  if (classId) filter.class = classId;

  const submissions = await Submission.find(filter)
    .populate('quiz', 'title subject topics timeLimit')
    .populate('class', 'name subject grade')
    .sort('-submittedAt');

  res.json({ success: true, submissions });
};

exports.getSubmission = async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('quiz', 'title subject questions passingScore allowReview')
    .populate('student', 'name email avatar grade')
    .populate('class', 'name subject grade');

  if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

  // Only student who submitted, teacher, or admin can view
  if (req.user.role === 'student' && submission.student._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.json({ success: true, submission });
};

exports.getQuizSubmissions = async (req, res) => {
  const submissions = await Submission.find({ quiz: req.params.quizId })
    .populate('student', 'name email avatar grade')
    .sort('-percentage');

  const stats = {
    totalSubmissions: submissions.length,
    avgScore: submissions.length > 0 
      ? Math.round(submissions.reduce((s, sub) => s + sub.percentage, 0) / submissions.length)
      : 0,
    passRate: submissions.length > 0
      ? Math.round((submissions.filter(s => s.passed).length / submissions.length) * 100)
      : 0,
    topScore: submissions.length > 0 ? Math.max(...submissions.map(s => s.percentage)) : 0,
    lowestScore: submissions.length > 0 ? Math.min(...submissions.map(s => s.percentage)) : 0,
  };

  res.json({ success: true, submissions, stats });
};

exports.getClassSubmissions = async (req, res) => {
  const submissions = await Submission.find({ class: req.params.classId })
    .populate('quiz', 'title subject topics')
    .populate('student', 'name email avatar grade')
    .sort('-submittedAt');

  res.json({ success: true, submissions });
};