const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllUsers, updateUserStatus, deleteUser, getAllClasses, updateClass, getSystemStats } = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/classes', getAllClasses);
router.put('/classes/:id', updateClass);
router.get('/stats', getSystemStats);

module.exports = router;