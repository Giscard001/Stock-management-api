
const express = require('express');
const router = express.Router();
// @desc    Create a Class
// @route   POST /api/academic/classes
const { getStructure, addLevel, addSubject, getClasses, createClass, createCourse, getTeacherCourses, addStudentToClass } = require('../controllers/academicController');
const { protect, authorize } = require('../middleware/auth');

router.get('/structure', protect, getStructure);
router.get('/classes', protect, getClasses);
router.get('/courses/teacher/:teacherId', protect, getTeacherCourses);

// Admin Only
router.post('/levels', protect, authorize('ADMIN'), addLevel);
router.post('/subjects', protect, authorize('ADMIN'), addSubject);
router.post('/classes', protect, authorize('ADMIN'), createClass);
router.post('/classes/:classId/students', protect, authorize('ADMIN'), addStudentToClass);
router.post('/courses', protect, authorize('ADMIN'), createCourse);

module.exports = router;
