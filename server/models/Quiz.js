const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index of correct option
  explanation: { type: String, default: '' },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points: { type: Number, default: 10 },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topics: [{ type: String }],
  questions: [questionSchema],
  timeLimit: { type: Number, default: 30 }, // minutes
  totalPoints: { type: Number, default: 0 },
  passingScore: { type: Number, default: 60 }, // percentage
  dueDate: { type: Date },
  isPublished: { type: Boolean, default: false },
  allowReview: { type: Boolean, default: true },
  shuffleQuestions: { type: Boolean, default: false },
  maxAttempts: { type: Number, default: 1 },
  status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
}, { timestamps: true });

quizSchema.pre('save', function (next) {
  this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  this.topics = [...new Set(this.questions.map(q => q.topic))];
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);