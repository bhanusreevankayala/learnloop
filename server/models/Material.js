const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, default: '' },
  type: { 
    type: String, 
    enum: ['notes', 'pdf', 'assignment', 'video', 'link', 'other'], 
    default: 'notes' 
  },
  content: { type: String, default: '' }, // text content or URL
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  dueDate: { type: Date },
  isPublished: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);