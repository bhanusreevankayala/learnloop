const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Class = require('../models/Class');

// Student analytics
exports.getStudentAnalytics = async (req, res) => {
  const studentId = req.params.studentId || req.user._id;

  const submissions = await Submission.find({ student: studentId })
    .populate('quiz', 'title subject topics')
    .populate('class', 'name subject')
    .sort('submittedAt');

  if (submissions.length === 0) {
    return res.json({
      success: true,
      analytics: {
        totalQuizzes: 0, avgScore: 0, passRate: 0,
        weakTopics: [], strongTopics: [],
        progressTrend: [], subjectPerformance: [],
        recentSubmissions: [],
      }
    });
  }

  // Topic-wise analysis
  const topicMap = {};
  submissions.forEach(sub => {
    sub.topicScores.forEach(ts => {
      if (!topicMap[ts.topic]) topicMap[ts.topic] = { correct: 0, total: 0, scores: [] };
      topicMap[ts.topic].correct += ts.correct;
      topicMap[ts.topic].total += ts.total;
      topicMap[ts.topic].scores.push(ts.percentage);
    });
  });

  const topicAnalysis = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    correct: data.correct,
    total: data.total,
    percentage: Math.round((data.correct / data.total) * 100),
    attempts: data.scores.length,
    trend: data.scores.slice(-3),
  })).sort((a, b) => a.percentage - b.percentage);

  const weakTopics = topicAnalysis.filter(t => t.percentage < 60);
  const strongTopics = topicAnalysis.filter(t => t.percentage >= 80);

  // Progress trend (last 10 submissions)
  const progressTrend = submissions.slice(-10).map(s => ({
    date: s.submittedAt,
    score: s.percentage,
    quiz: s.quiz?.title || 'Unknown',
    subject: s.quiz?.subject || 'Unknown',
  }));

  // Subject performance
  const subjectMap = {};
  submissions.forEach(s => {
    const subj = s.quiz?.subject || 'Unknown';
    if (!subjectMap[subj]) subjectMap[subj] = [];
    subjectMap[subj].push(s.percentage);
  });

  const subjectPerformance = Object.entries(subjectMap).map(([subject, scores]) => ({
    subject,
    avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    quizCount: scores.length,
  }));

  const avgScore = Math.round(submissions.reduce((s, sub) => s + sub.percentage, 0) / submissions.length);
  const passRate = Math.round((submissions.filter(s => s.passed).length / submissions.length) * 100);

  res.json({
    success: true,
    analytics: {
      totalQuizzes: submissions.length,
      avgScore,
      passRate,
      weakTopics,
      strongTopics,
      topicAnalysis,
      progressTrend,
      subjectPerformance,
      recentSubmissions: submissions.slice(-5).reverse(),
    }
  });
};

// Teacher class analytics
exports.getClassAnalytics = async (req, res) => {
  const { classId } = req.params;
  const cls = await Class.findById(classId).populate('students', 'name email avatar grade averageScore');

  if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

  const submissions = await Submission.find({ class: classId })
    .populate('student', 'name email avatar grade')
    .populate('quiz', 'title subject topics');

  const quizzes = await Quiz.find({ class: classId });

  // Student performance
  const studentMap = {};
  submissions.forEach(sub => {
    const id = sub.student._id.toString();
    if (!studentMap[id]) {
      studentMap[id] = {
        student: sub.student,
        scores: [],
        quizzesTaken: 0,
        topicScores: {},
      };
    }
    studentMap[id].scores.push(sub.percentage);
    studentMap[id].quizzesTaken++;
    sub.topicScores.forEach(ts => {
      if (!studentMap[id].topicScores[ts.topic]) {
        studentMap[id].topicScores[ts.topic] = { correct: 0, total: 0 };
      }
      studentMap[id].topicScores[ts.topic].correct += ts.correct;
      studentMap[id].topicScores[ts.topic].total += ts.total;
    });
  });

  const studentPerformance = Object.values(studentMap).map(sp => ({
    student: sp.student,
    avgScore: sp.scores.length > 0 ? Math.round(sp.scores.reduce((a, b) => a + b, 0) / sp.scores.length) : 0,
    quizzesTaken: sp.quizzesTaken,
    weakTopics: Object.entries(sp.topicScores)
      .filter(([, d]) => Math.round((d.correct / d.total) * 100) < 60)
      .map(([topic]) => topic),
    needsAttention: sp.scores.length > 0 && (sp.scores.reduce((a, b) => a + b, 0) / sp.scores.length) < 60,
  })).sort((a, b) => b.avgScore - a.avgScore);

  // Topic-wise class performance
  const topicMap = {};
  submissions.forEach(sub => {
    sub.topicScores.forEach(ts => {
      if (!topicMap[ts.topic]) topicMap[ts.topic] = { correct: 0, total: 0, students: new Set() };
      topicMap[ts.topic].correct += ts.correct;
      topicMap[ts.topic].total += ts.total;
      topicMap[ts.topic].students.add(sub.student._id.toString());
    });
  });

  const topicPerformance = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    avgScore: Math.round((data.correct / data.total) * 100),
    studentsAttempted: data.students.size,
  })).sort((a, b) => a.avgScore - b.avgScore);

  // Quiz performance trend
  const quizPerformance = await Promise.all(
    quizzes.map(async (quiz) => {
      const subs = submissions.filter(s => s.quiz?._id.toString() === quiz._id.toString());
      return {
        quiz: quiz.title,
        avgScore: subs.length > 0 ? Math.round(subs.reduce((s, sub) => s + sub.percentage, 0) / subs.length) : 0,
        submissions: subs.length,
        passRate: subs.length > 0 ? Math.round((subs.filter(s => s.passed).length / subs.length) * 100) : 0,
      };
    })
  );

  res.json({
    success: true,
    analytics: {
      class: cls,
      totalStudents: cls.students.length,
      totalQuizzes: quizzes.length,
      totalSubmissions: submissions.length,
      classAvgScore: submissions.length > 0
        ? Math.round(submissions.reduce((s, sub) => s + sub.percentage, 0) / submissions.length)
        : 0,
      studentsNeedingAttention: studentPerformance.filter(s => s.needsAttention),
      topPerformers: studentPerformance.slice(0, 5),
      studentPerformance,
      topicPerformance,
      quizPerformance,
    }
  });
};

// Admin school analytics
exports.getSchoolAnalytics = async (req, res) => {
  const [userCount, classCount, quizCount, submissionCount] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Class.countDocuments({ isActive: true }),
    Quiz.countDocuments(),
    Submission.countDocuments(),
  ]);

  const studentCount = await User.countDocuments({ role: 'student', isActive: true });
  const teacherCount = await User.countDocuments({ role: 'teacher', isActive: true });

  const recentSubmissions = await Submission.find()
    .populate('student', 'name grade')
    .populate('quiz', 'title subject')
    .sort('-submittedAt')
    .limit(10);

  const avgScore = await Submission.aggregate([
    { $group: { _id: null, avg: { $avg: '$percentage' } } }
  ]);

  const subjectPerformance = await Submission.aggregate([
    { $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quizData' } },
    { $unwind: '$quizData' },
    { $group: { _id: '$quizData.subject', avgScore: { $avg: '$percentage' }, count: { $sum: 1 } } },
    { $sort: { avgScore: -1 } }
  ]);

  const monthlyActivity = await Submission.aggregate([
    { $group: {
      _id: { month: { $month: '$submittedAt' }, year: { $year: '$submittedAt' } },
      count: { $sum: 1 },
      avgScore: { $avg: '$percentage' }
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  res.json({
    success: true,
    analytics: {
      overview: { userCount, studentCount, teacherCount, classCount, quizCount, submissionCount },
      avgScore: avgScore[0]?.avg ? Math.round(avgScore[0].avg) : 0,
      subjectPerformance: subjectPerformance.map(s => ({ subject: s._id, avgScore: Math.round(s.avgScore), count: s.count })),
      monthlyActivity: monthlyActivity.map(m => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
        submissions: m.count,
        avgScore: Math.round(m.avgScore),
      })),
      recentSubmissions,
    }
  });
};