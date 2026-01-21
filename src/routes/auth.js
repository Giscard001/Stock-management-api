
const express = require('express');
const router = express.Router();
const { register, login, setupAdmin, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', upload.single('profilePhoto'), register);
router.post('/login', login);
router.post('/setup-admin', upload.single('profilePhoto'), setupAdmin);
router.get('/profile', protect, getProfile);

module.exports = router;
