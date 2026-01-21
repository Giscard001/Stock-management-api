
const { calculateGeneralAverage } = require('../utils/gradeCalculator');
const SchoolClass = require('../models/SchoolClass');
const User = require('../models/User');
const Bulletin = require('../models/Bulletin');

// @desc    Generate Bulletin for a Student
// @route   GET /api/bulletins/student/:studentId
// @access  Private (Proviseur, Censeur, Secretaire, Parent, Eleve)
exports.getStudentBulletin = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { period } = req.query; // e.g., "Trimestre 1"

        // Authorization checks needed (Parent owns student, etc.)

        // Find Student to get Class ID
        // Note: Our User model doesn't strictly store classId, but Student profile should.
        // We might need to look up Class where student is enrolled.
        const classes = SchoolClass.getAll();
        const studentClass = classes.find(c => c.students.includes(studentId)); // Assuming students array in class

        if (!studentClass) {
            // Fallback: Check if we can find class via other means or if logic differs.
            // For now, assume simple link.
            return res.status(404).json({ message: 'Student not assigned to a class' });
        }

        const bulletin = await calculateGeneralAverage(studentId, studentClass.id, period);

        // Enhance with Student Info
        const student = User.findById(studentId);

        res.json({
            student: { firstName: student.firstName, lastName: student.lastName, id: student.id },
            class: { name: studentClass.name, id: studentClass.id },
            ...bulletin
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate and Save Bulletin (Proviseur)
// @route   POST /api/bulletins/validate
// @access  Private (Proviseur)
exports.validateBulletin = async (req, res) => {
    try {
        const { studentId, period } = req.body;

        // 1. Calculate
        // We need classId.
        const classes = SchoolClass.getAll();
        const studentClass = classes.find(c => c.students.includes(studentId));
        if (!studentClass) return res.status(404).json({ message: 'Student not in class' });

        const data = await calculateGeneralAverage(studentId, studentClass.id, period);

        // 2. Save snapshot
        const student = User.findById(studentId);

        const bulletin = Bulletin.create({
            studentId,
            period,
            classId: studentClass.id,
            className: studentClass.name,
            studentName: `${student.firstName} ${student.lastName}`,
            data,
            status: 'VALIDATED'
        });

        res.status(201).json(bulletin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Proviseur Dashboard Stats
// @route   GET /api/proviseur/dashboard
// @access  Private (Proviseur)
exports.getDashboard = async (req, res) => {
    try {
        const bulletins = Bulletin.getAll() || [];
        const validatedCount = bulletins.filter(b => b.status === 'VALIDATED').length;
        const classes = SchoolClass.getAll().length;
        const students = User.getUsers().filter(u => u.role === 'ELEVE').length;

        res.json({
            stats: {
                classes,
                students,
                bulletinsValidated: validatedCount,
                pendingBulletins: bulletins.length - validatedCount
            },
            recentActivity: []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unlock Bulletin
// @route   PATCH /api/proviseur/unlock
// @access  Private (Proviseur)
exports.unlockBulletin = async (req, res) => {
    try {
        const { studentId, period } = req.body;
        const bulletins = Bulletin.getAll();
        const bulletin = bulletins.find(b => b.studentId === studentId && b.period === period);

        if (!bulletin) return res.status(404).json({ message: 'Bulletin not found' });

        bulletin.status = 'DRAFT'; // Reset to draft
        // Save logic would go here (Bulletin.save(bulletins))

        res.json({ message: 'Bulletin unlocked', bulletin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Bulletins (List)
// @route   GET /api/proviseur/bulletins
// @access  Private (Proviseur, Secretaire)
exports.getAllBulletins = async (req, res) => {
    try {
        const query = req.query; // Filter by class, status etc.
        const bulletins = Bulletin.getAll() || [];
        res.json(bulletins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
