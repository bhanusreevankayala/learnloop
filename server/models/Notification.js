const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['quiz', 'announcement', 'material', 'grade', 'reminder', 'system'], 
    default: 'system' 
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipients: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
  }],
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  relatedId: { type: String }, // ID of quiz/material etc
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  expiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);