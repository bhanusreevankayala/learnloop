const Class = require('../models/Class');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createClass = async (req, res) => {
  const { name, description, grade, subject, schedule, coverColor } = req.body;

  const cls = await Class.create({
    name, description, grade, subject, schedule, coverColor,
    teacher: req.user._id,
  });

  await User.findByIdAndUpdate(req.user._id, {
    $push: { teachingClasses: cls._id }
  });

  await cls.populate('teacher', 'name email avatar');
  res.status(201).json({ success: true, class: cls });
};

exports.getClasses = async (req, res) => {
  let classes;
  if (req.user.role === 'teacher') {
    classes = await Class.find({ teacher: req.user._id, isActive: true })
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email avatar grade');
  } else if (req.user.role === 'student') {
    classes = await Class.find({ students: req.user._id, isActive: true })
      .populate('teacher', 'name email avatar');
  } else {
    classes = await Class.find({ isActive: true })
      .populate('teacher', 'name email avatar')
      .populate('students', 'name email');
  }
  res.json({ success: true, classes });
};

exports.getClass = async (req, res) => {
  const cls = await Class.findById(req.params.id)
    .populate('teacher', 'name email avatar subjects')
    .populate('students', 'name email avatar grade averageScore');
  
  if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
  res.json({ success: true, class: cls });
};

exports.updateClass = async (req, res) => {
  const cls = await Class.findById(req.params.id);
  if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
  if (cls.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const updated = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('teacher', 'name email').populate('students', 'name email');
  res.json({ success: true, class: updated });
};

exports.joinClass = async (req, res) => {
  const { joinCode } = req.body;
  const cls = await Class.findOne({ joinCode: joinCode.toUpperCase(), isActive: true });
  if (!cls) return res.status(404).json({ success: false, message: 'Invalid class code' });

  if (cls.students.includes(req.user._id)) {
    return res.status(400).json({ success: false, message: 'Already enrolled in this class' });
  }

  cls.students.push(req.user._id);
  await cls.save();
  await User.findByIdAndUpdate(req.user._id, { $push: { enrolledClasses: cls._id } });

  // Notify teacher
  await Notification.create({
    title: 'New Student Joined',
    message: `${req.user.name} joined your class "${cls.name}"`,
    type: 'announcement',
    sender: req.user._id,
    recipients: [{ user: cls.teacher }],
    class: cls._id,
  });

  await cls.populate('teacher', 'name email');
  res.json({ success: true, class: cls, message: `Successfully joined ${cls.name}` });
};

exports.removeStudent = async (req, res) => {
  const { studentId } = req.params;
  const cls = await Class.findById(req.params.id);
  if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

  cls.students = cls.students.filter(s => s.toString() !== studentId);
  await cls.save();
  await User.findByIdAndUpdate(studentId, { $pull: { enrolledClasses: cls._id } });

  res.json({ success: true, message: 'Student removed from class' });
};

exports.deleteClass = async (req, res) => {
  const cls = await Class.findById(req.params.id);
  if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

  cls.isActive = false;
  await cls.save();
  res.json({ success: true, message: 'Class archived successfully' });
};