
const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser, getSystemLogs } = require('../controllers/userController');
const { getProfile } = require('../controllers/authController'); // Reuse getProfile
const { protect, authorize } = require('../middleware/auth');

// Public/Private/Shared
router.get('/profile', protect, getProfile);

// Admin Only
router.get('/', protect, authorize('ADMIN'), getAllUsers);
router.put('/:id/role', protect, authorize('ADMIN'), updateUserRole);
router.delete('/:id', protect, authorize('ADMIN'), deleteUser);
router.get('/admin/logs', protect, authorize('ADMIN'), getSystemLogs);

module.exports = router;
