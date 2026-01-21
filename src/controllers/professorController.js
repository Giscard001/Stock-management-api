
const Assignment = require('../models/Assignment');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Create Assignment
// @route   POST /api/professor/assignments
// @access  Private (Professor)
exports.createAssignment = async (req, res) => {
    try {
        const { courseId, title, type, date, maxScore } = req.body;

        // Verify teacher owns course
        const courses = Course.findByTeacher(req.user.id);
        if (!courses.find(c => c.id === courseId)) {
            return res.status(403).json({ message: 'Not authorized for this course' });
        }

        const assignment = Assignment.create({
            courseId,
            title,
            type, // 'DEVOIR', 'COMPO'
            date,
            maxScore: maxScore || 20
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Enter/Update Grade
// @route   POST /api/professor/grades
// @access  Private (Professor)
exports.enterGrade = async (req, res) => {
    try {
        const { assignmentId, studentId, value, comment } = req.body;

        // Validation: Check if teacher owns the assignment (via course)
        const assignment = Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        const courses = Course.findByTeacher(req.user.id);
        if (!courses.find(c => c.id === assignment.courseId)) {
            return res.status(403).json({ message: 'Not authorized for this assignment' });
        }

        if (value < 0 || value > 20) {
            return res.status(400).json({ message: 'Grade must be between 0 and 20' });
        }

        const grade = Grade.createOrUpdate({
            studentId,
            assignmentId,
            value,
            comment,
            authorId: req.user.id
        });

        res.json(grade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Assignments for a Course
// @route   GET /api/professor/courses/:courseId/assignments
// @access  Private (Professor)
exports.getCourseAssignments = async (req, res) => {
    try {
        const { courseId } = req.params;
        const courses = Course.findByTeacher(req.user.id);
        if (!courses.find(c => c.id === courseId)) {
            return res.status(403).json({ message: 'Not authorized for this course' });
        }

        const assignments = Assignment.findByCourse(courseId);
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Grades for an Assignment
// @route   GET /api/professor/assignments/:assignmentId/grades
// @access  Private (Professor)
exports.getAssignmentGrades = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        const courses = Course.findByTeacher(req.user.id);
        if (!courses.find(c => c.id === assignment.courseId)) {
            return res.status(403).json({ message: 'Not authorized for this assignment' });
        }

        const grades = Grade.findByAssignment(assignmentId);
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
