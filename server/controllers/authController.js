const User = require('../models/User');
const Class = require('../models/Class');
const { generateToken } = require('../middleware/auth');

exports.register = async (req, res) => {
  const { name, email, password, role, joinCode, subjects, grade } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, role, subjects, grade });

  // If student with joinCode, enroll in class
  if (role === 'student' && joinCode) {
    const cls = await Class.findOne({ joinCode: joinCode.toUpperCase() });
    if (cls) {
      cls.students.push(user._id);
      await cls.save();
      user.enrolledClasses.push(cls._id);
      await user.save();
    }
  }

  const token = generateToken(user._id);
  res.status(201).json({ success: true, token, user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate('enrolledClasses', 'name subject grade').populate('teachingClasses', 'name subject grade');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account deactivated. Contact admin.' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);
  res.json({ success: true, token, user });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('enrolledClasses', 'name subject grade teacher coverColor')
    .populate('teachingClasses', 'name subject grade students coverColor');
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res) => {
  const { name, phone, grade, subjects, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, grade, subjects, avatar },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
};