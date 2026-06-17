const User = require('../models/User');
const Class = require('../models/Class');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');

exports.getAllUsers = async (req, res) => {
  const { role, search } = req.query;
  let filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ];

  const users = await User.find(filter).sort('-createdAt');
  res.json({ success: true, users, total: users.length });
};

exports.updateUserStatus = async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deleted' });
};

exports.getAllClasses = async (req, res) => {
  const classes = await Class.find()
    .populate('teacher', 'name email')
    .populate('students', 'name email')
    .sort('-createdAt');
  res.json({ success: true, classes });
};

exports.updateClass = async (req, res) => {
  const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
  res.json({ success: true, class: cls });
};

exports.getSystemStats = async (req, res) => {
  const stats = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'teacher', isActive: true }),
    User.countDocuments({ role: 'admin' }),
    Class.countDocuments({ isActive: true }),
    Quiz.countDocuments(),
    Submission.countDocuments(),
  ]);

  const [students, teachers, admins, classes, quizzes, submissions] = stats;

  const passRate = await Submission.aggregate([
    { $group: { _id: null, passed: { $sum: { $cond: ['$passed', 1, 0] } }, total: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    stats: {
      students, teachers, admins, classes, quizzes, submissions,
      passRate: passRate[0] ? Math.round((passRate[0].passed / passRate[0].total) * 100) : 0,
    }
  });
};