const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  isActive: { type: Boolean, default: true },

  enrolledClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  grade: { type: String, default: '' },

  teachingClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  subjects: [{ type: String }],

  lastLogin: { type: Date },
  totalQuizzesTaken: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
}, { timestamps: true });

/* =========================
   HASH PASSWORD
========================= */
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();

    if (!this.password) {
      throw new Error("Password is required");
    }

    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

/* =========================
   SAFE PASSWORD CHECK
========================= */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    if (!candidatePassword || !this.password) {
      return false;
    }

    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    console.error("bcrypt compare error:", err.message);
    return false;
  }
};

/* =========================
   REMOVE PASSWORD FROM OUTPUT
========================= */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);