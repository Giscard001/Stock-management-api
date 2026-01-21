
const express = require('express');
const router = express.Router();
const { getAllGrades, validateGrade, modifyGrade } = require('../controllers/censeurController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
// Allow CENSEUR, PROVISEUR, ADMIN
router.use(authorize('CENSEUR', 'PROVISEUR', 'ADMIN'));

router.get('/grades', getAllGrades);
router.put('/grades/:id/validate', validateGrade);
router.put('/grades/:id', modifyGrade);

module.exports = router;
