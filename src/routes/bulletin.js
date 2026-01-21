
const express = require('express');
const router = express.Router();
const { getStudentBulletin, validateBulletin } = require('../controllers/bulletinController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/student/:studentId', getStudentBulletin);
router.post('/validate', protect, authorize('PROVISEUR', 'ADMIN'), validateBulletin);

module.exports = router;
