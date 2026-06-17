const Notification = require('../models/Notification');
const Class = require('../models/Class');

exports.getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({
    'recipients.user': req.user._id,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }]
  })
    .populate('sender', 'name avatar role')
    .populate('class', 'name')
    .sort('-createdAt')
    .limit(50);

  const formatted = notifications.map(n => {
    const recipientData = n.recipients.find(r => r.user.toString() === req.user._id.toString());
    return {
      _id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      sender: n.sender,
      class: n.class,
      relatedId: n.relatedId,
      priority: n.priority,
      read: recipientData?.read || false,
      readAt: recipientData?.readAt,
      createdAt: n.createdAt,
    };
  });

  const unreadCount = formatted.filter(n => !n.read).length;
  res.json({ success: true, notifications: formatted, unreadCount });
};

exports.markAsRead = async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, 'recipients.user': req.user._id },
    { $set: { 'recipients.$.read': true, 'recipients.$.readAt': new Date() } }
  );
  res.json({ success: true, message: 'Notification marked as read' });
};

exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { 'recipients.user': req.user._id, 'recipients.read': false },
    { $set: { 'recipients.$[elem].read': true, 'recipients.$[elem].readAt': new Date() } },
    { arrayFilters: [{ 'elem.user': req.user._id }] }
  );
  res.json({ success: true, message: 'All notifications marked as read' });
};

exports.sendAnnouncement = async (req, res) => {
  const { title, message, classId, priority } = req.body;

  const cls = await Class.findById(classId);
  if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

  const recipients = cls.students.map(s => ({ user: s }));
  const notification = await Notification.create({
    title, message, type: 'announcement',
    sender: req.user._id,
    recipients,
    class: classId,
    priority: priority || 'medium',
  });

  res.status(201).json({ success: true, notification, message: `Announcement sent to ${recipients.length} students` });
};

exports.deleteNotification = async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Notification deleted' });
};