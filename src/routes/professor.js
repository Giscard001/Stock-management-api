
const express = require('express');
const router = express.Router();
const { createAssignment, enterGrade, getCourseAssignments, getAssignmentGrades } = require('../controllers/professorController');
const { protect, authorize } = require('../middleware/auth');

// All routes require role PROFESSEUR (or ADMIN sometimes?)
// Strict RBAC: Only PROFESSEUR can use these.
router.use(protect);
router.use(authorize('PROFESSEUR', 'ADMIN')); // Admin might need access too

router.post('/assignments', createAssignment);
router.post('/grades', enterGrade);
router.get('/courses/:courseId/assignments', getCourseAssignments);
router.get('/assignments/:assignmentId/grades', getAssignmentGrades);

module.exports = router;
