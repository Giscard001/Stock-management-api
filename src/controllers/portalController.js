
const User = require('../models/User');
const Grade = require('../models/Grade');
const Assignment = require('../models/Assignment');
const { calculateGeneralAverage } = require('../utils/gradeCalculator');

// @desc    Link Child (Parent)
// @route   POST /api/portal/link-child
// @access  Private (Parent)
exports.linkChild = async (req, res) => {
    try {
        const { childEmail } = req.body;

        const child = User.findByEmail(childEmail);
        if (!child) {
            return res.status(404).json({ message: 'Child account not found' });
        }

        // Security check: Verify date of birth or code if implemented.
        // For now, assume simplified flow.

        User.addChild(req.user.id, child.id);

        res.json({ message: 'Child linked successfully', child: { id: child.id, name: `${child.firstName} ${child.lastName}` } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get My Grades (Student)
// @route   GET /api/portal/my-grades
// @access  Private (Eleve)
exports.getMyGrades = async (req, res) => {
    try {
        const grades = Grade.findByStudent(req.user.id);
        // Enrich with Assignment Info
        const assignments = Assignment.getAll();

        const enrichedGrades = grades.map(g => {
            const assignment = assignments.find(a => a.id === g.assignmentId);
            return {
                ...g,
                assignmentTitle: assignment ? assignment.title : 'Unknown',
                assignmentType: assignment ? assignment.type : 'Unknown',
                maxScore: assignment ? assignment.maxScore : 20
            };
        });

        res.json(enrichedGrades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Portal History (Grades)
// @route   GET /api/portal/history
// @access  Private (Student/Parent)
exports.getHistory = async (req, res) => {
    try {
        const studentId = req.user.role === 'PARENT' ? req.query.childId : req.user.id;
        if (!studentId) return res.status(400).json({ message: 'Student ID required' });

        // Reuse getMyGrades logic or fetch historical archives
        const grades = Grade.findByStudent(studentId);
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Available Bulletins
// @route   GET /api/portal/bulletins
// @access  Private (Student/Parent)
exports.getBulletinsList = async (req, res) => {
    try {
        const studentId = req.user.role === 'PARENT' ? req.query.childId : req.user.id;
        // In a real DB we would query Bulletins where status = PUBLISHED
        const bulletins = Bulletin.findByStudent(studentId);
        res.json(bulletins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Child Grades (Parent)
// @route   GET /api/portal/child/:childId/grades
// @access  Private (Parent)
exports.getChildGrades = async (req, res) => {
    try {
        const { childId } = req.params;

        // Verify Parent-Child link
        const parent = User.findById(req.user.id);
        if (!parent.childrenIds || !parent.childrenIds.includes(childId)) {
            return res.status(403).json({ message: 'Not authorized for this student' });
        }

        const grades = Grade.findByStudent(childId);
        // Enrich
        const assignments = Assignment.getAll();
        const enrichedGrades = grades.map(g => {
            const assignment = assignments.find(a => a.id === g.assignmentId);
            return {
                ...g,
                assignmentTitle: assignment ? assignment.title : 'Unknown',
                assignmentType: assignment ? assignment.type : 'Unknown',
                maxScore: assignment ? assignment.maxScore : 20
            };
        });

        res.json(enrichedGrades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
