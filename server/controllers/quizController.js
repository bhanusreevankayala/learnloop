const Quiz = require('../models/Quiz');
const Class = require('../models/Class');
const Notification = require('../models/Notification');

exports.createQuiz = async (req, res) => {
  const { title, description, classId, subject, questions, timeLimit, dueDate, passingScore, allowReview, shuffleQuestions, maxAttempts } = req.body;

  const cls = await Class.findById(classId);
  if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

  const quiz = await Quiz.create({
    title, description, class: classId, subject,
    questions, timeLimit, dueDate, passingScore, allowReview, shuffleQuestions, maxAttempts,
    teacher: req.user._id,
    status: 'draft',
  });

  res.status(201).json({ success: true, quiz });
};

exports.publishQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('class');
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
  if (quiz.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  quiz.isPublished = true;
  quiz.status = 'active';
  await quiz.save();

  // Notify all students in the class
  const studentRecipients = quiz.class.students.map(s => ({ user: s }));
  if (studentRecipients.length > 0) {
    await Notification.create({
      title: 'New Quiz Available',
      message: `A new quiz "${quiz.title}" has been published in ${quiz.class.name}`,
      type: 'quiz',
      sender: req.user._id,
      recipients: studentRecipients,
      class: quiz.class._id,
      relatedId: quiz._id.toString(),
      priority: 'high',
    });
  }

  res.json({ success: true, quiz, message: 'Quiz published and students notified' });
};

exports.getQuizzes = async (req, res) => {
  const { classId } = req.query;
  let filter = {};
  
  if (classId) filter.class = classId;
  
  if (req.user.role === 'teacher') {
    filter.teacher = req.user._id;
  } else if (req.user.role === 'student') {
    const user = await require('../models/User').findById(req.user._id);
    filter.class = { $in: user.enrolledClasses };
    filter.isPublished = true;
  }

  const quizzes = await Quiz.find(filter)
    .populate('class', 'name subject grade coverColor')
    .populate('teacher', 'name email')
    .sort('-createdAt');

  res.json({ success: true, quizzes });
};

exports.getQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate('class', 'name subject grade')
    .populate('teacher', 'name email');

  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

  // Students don't see correct answers before submitting
  if (req.user.role === 'student') {
    const sanitized = quiz.toObject();
    sanitized.questions = sanitized.questions.map(q => {
      const { correctAnswer, explanation, ...rest } = q;
      return rest;
    });
    return res.json({ success: true, quiz: sanitized });
  }

  res.json({ success: true, quiz });
};

exports.updateQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
  if (quiz.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, quiz: updated });
};

exports.deleteQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
  if (quiz.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await quiz.deleteOne();
  res.json({ success: true, message: 'Quiz deleted' });
};

exports.closeQuiz = async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    { status: 'closed', isPublished: false },
    { new: true }
  );
  res.json({ success: true, quiz });
};