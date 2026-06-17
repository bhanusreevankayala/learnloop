const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  grade: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinCode: { type: String, unique: true },
  isActive: { type: Boolean, default: true },
  academicYear: { type: String, default: new Date().getFullYear().toString() },
  schedule: { type: String, default: '' },
  coverColor: { 
    type: String, 
    default: '#4F46E5',
    enum: ['#4F46E5', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777']
  },
}, { timestamps: true });

classSchema.pre('save', function (next) {
  if (!this.joinCode) {
    this.joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Class', classSchema);