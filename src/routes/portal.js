
const express = require('express');
const router = express.Router();
const { linkChild, getMyGrades, getChildGrades, getHistory, getBulletinsList } = require('../controllers/portalController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/link-child', authorize('PARENT'), linkChild);
router.get('/my-grades', authorize('ELEVE'), getMyGrades);
router.get('/child/:childId/grades', authorize('PARENT'), getChildGrades);
router.get('/history', authorize('ELEVE', 'PARENT'), getHistory);
router.get('/bulletins', authorize('ELEVE', 'PARENT'), getBulletinsList);

module.exports = router;
