const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createMaterial, getMaterials, getMaterial, updateMaterial, deleteMaterial } = require('../controllers/materialController');

// Note: upload middleware would be added when Cloudinary is configured
router.post('/', protect, authorize('teacher', 'admin'), createMaterial);
router.get('/', protect, getMaterials);
router.get('/:id', protect, getMaterial);
router.put('/:id', protect, authorize('teacher', 'admin'), updateMaterial);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteMaterial);

module.exports = router;