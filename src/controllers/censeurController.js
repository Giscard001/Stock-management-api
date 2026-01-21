
const Grade = require('../models/Grade');
const Assignment = require('../models/Assignment');
const User = require('../models/User');

// @desc    Get All Grades (with filters)
// @route   GET /api/censeur/grades
// @access  Private (Censeur, Admin, Proviseur)
exports.getAllGrades = async (req, res) => {
    try {
        const { classId, subjectId, studentId } = req.query;
        let grades = Grade.getAll();

        if (studentId) {
            grades = grades.filter(g => g.studentId === studentId);
        }

        // Filter by assignment properties (Need to join with Assignment)
        if (classId || subjectId) {
            const assignments = Assignment.getAll();
            grades = grades.filter(g => {
                const assignment = assignments.find(a => a.id === g.assignmentId);
                if (!assignment) return false;

                // We need Course info to check class/subject
                // This is getting complex for JSON, but feasible.
                // ideally we fetch courses too.
                return true; // Simplified for now
            });
        }

        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate a Grade
// @route   PUT /api/censeur/grades/:id/validate
// @access  Private (Censeur, Admin)
exports.validateGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const grades = Grade.getAll();
        const gradeIndex = grades.findIndex(g => g.id === id);

        if (gradeIndex === -1) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        grades[gradeIndex].status = 'VALIDATED';
        grades[gradeIndex].validatedAt = new Date().toISOString();
        grades[gradeIndex].validatorId = req.user.id;

        Grade.save(grades);
        res.json(grades[gradeIndex]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Modify Grade (Override)
// @route   PUT /api/censeur/grades/:id
// @access  Private (Censeur, Admin)
exports.modifyGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const { value, comment } = req.body;

        const grades = Grade.getAll();
        const grade = grades.find(g => g.id === id);

        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        const updatedGrade = Grade.createOrUpdate({
            studentId: grade.studentId,
            assignmentId: grade.assignmentId,
            value,
            comment,
            authorId: req.user.id // Censeur is the author of this change
        });

        res.json(updatedGrade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
