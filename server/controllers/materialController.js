const Material = require('../models/Material');
const Notification = require('../models/Notification');
const Class = require('../models/Class');

exports.createMaterial = async (req, res) => {
  const { title, description, classId, subject, topic, type, content, dueDate, tags } = req.body;

  const cls = await Class.findById(classId);
  if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

  const materialData = {
    title, description, class: classId, subject, topic, type, content, dueDate, tags,
    teacher: req.user._id,
  };

  if (req.file) {
    materialData.fileUrl = req.file.path;
    materialData.fileName = req.file.originalname;
    materialData.fileSize = req.file.size;
  }

  const material = await Material.create(materialData);

  // Notify students
  const studentRecipients = cls.students.map(s => ({ user: s }));
  if (studentRecipients.length > 0) {
    await Notification.create({
      title: 'New Study Material',
      message: `"${title}" has been added to ${cls.name}`,
      type: 'material',
      sender: req.user._id,
      recipients: studentRecipients,
      class: classId,
      relatedId: material._id.toString(),
    });
  }

  await material.populate('teacher', 'name email');
  res.status(201).json({ success: true, material });
};

exports.getMaterials = async (req, res) => {
  const { classId, type } = req.query;
  let filter = {};
  
  if (classId) filter.class = classId;
  if (type) filter.type = type;

  if (req.user.role === 'teacher') {
    filter.teacher = req.user._id;
  } else if (req.user.role === 'student') {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    filter.class = { $in: user.enrolledClasses };
    filter.isPublished = true;
  }

  const materials = await Material.find(filter)
    .populate('teacher', 'name email avatar')
    .populate('class', 'name subject grade coverColor')
    .sort('-createdAt');

  res.json({ success: true, materials });
};

exports.getMaterial = async (req, res) => {
  const material = await Material.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('teacher', 'name email').populate('class', 'name subject grade');

  if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
  res.json({ success: true, material });
};

exports.updateMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
  if (material.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const updated = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, material: updated });
};

exports.deleteMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
  if (material.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await material.deleteOne();
  res.json({ success: true, message: 'Material deleted' });
};  