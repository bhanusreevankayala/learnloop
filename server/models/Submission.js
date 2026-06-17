const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId },
  question: { type: String },
  topic: { type: String },
  selectedAnswer: { type: Number }, // index
  correctAnswer: { type: Number },
  isCorrect: { type: Boolean },
  points: { type: Number, default: 0 },
  maxPoints: { type: Number, default: 10 },
});

const submissionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  timeTaken: { type: Number, default: 0 }, // seconds
  submittedAt: { type: Date, default: Date.now },
  topicScores: [{
    topic: String,
    correct: Number,
    total: Number,
    percentage: Number,
  }],
  attemptNumber: { type: Number, default: 1 },
  feedback: { type: String, default: '' },
}, { timestamps: true });

// Compute topic-wise scores
submissionSchema.pre('save', function (next) {
  const topicMap = {};
  this.answers.forEach(ans => {
    if (!topicMap[ans.topic]) topicMap[ans.topic] = { correct: 0, total: 0 };
    topicMap[ans.topic].total++;
    if (ans.isCorrect) topicMap[ans.topic].correct++;
  });

  this.topicScores = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    correct: data.correct,
    total: data.total,
    percentage: Math.round((data.correct / data.total) * 100),
  }));

  this.totalPoints = this.answers.reduce((sum, a) => sum + a.maxPoints, 0);
  this.score = this.answers.reduce((sum, a) => sum + a.points, 0);
  this.percentage = this.totalPoints > 0 
    ? Math.round((this.score / this.totalPoints) * 100) 
    : 0;
  next();
});

module.exports = mongoose.model('Submission', submissionSchema);