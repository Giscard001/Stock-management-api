
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateBulletin, getDashboard, unlockBulletin, getAllBulletins } = require('../controllers/bulletinController');

router.get('/dashboard', protect, authorize('PROVISEUR'), getDashboard);
router.post('/validate-bulletin', protect, authorize('PROVISEUR'), validateBulletin);
router.patch('/unlock', protect, authorize('PROVISEUR'), unlockBulletin);
router.get('/bulletins', protect, authorize('PROVISEUR', 'SECRETAIRE'), getAllBulletins);

module.exports = router;
