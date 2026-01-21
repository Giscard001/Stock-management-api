
const express = require('express');
const router = express.Router();
const { importStudents, generateBulletinPDF, getArchives } = require('../controllers/secretaryController');
const { getAllBulletins } = require('../controllers/bulletinController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

// Import: Secretary or Admin
router.post('/import-students', authorize('SECRETAIRE', 'ADMIN'), upload.single('file'), importStudents);

// PDF: Secretary, Admin, or the User/Parent (Logic inside controller could/should refine access, but here we allow basics)
// For simplicity, allow all authenticated for now, but in prod refine.
router.get('/bulletins/:studentId/pdf', authorize('SECRETAIRE', 'ADMIN', 'PARENT', 'ELEVE'), generateBulletinPDF);

// Get all bulletins for admin/secretary
router.get('/bulletins', authorize('SECRETAIRE', 'ADMIN'), getAllBulletins);

// Get archives for admin/secretary
router.get('/archive', authorize('SECRETAIRE', 'ADMIN'), getArchives);

module.exports = router;
