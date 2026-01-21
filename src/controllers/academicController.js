
const Academic = require('../models/Academic');
const SchoolClass = require('../models/SchoolClass');
const Course = require('../models/Course');

// @desc    Get Academic Structure (Streams, Levels, Subjects)
// @route   GET /api/academic/structure
// @access  Private
exports.getStructure = async (req, res) => {
    try {
        const structure = Academic.getData();
        res.json(structure);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a Level to a Stream
// @route   POST /api/academic/levels
// @access  Private/Admin
exports.addLevel = async (req, res) => {
    try {
        const { streamId, name, id } = req.body;
        const newLevel = {
            id: id || name.toLowerCase().replace(/\s+/g, '_'),
            name,
            subjects: []
        };
        const level = Academic.addLevel(streamId, newLevel);
        res.status(201).json(level);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a Subject to a Level
// @route   POST /api/academic/subjects
// @access  Private/Admin
exports.addSubject = async (req, res) => {
    try {
        const { streamId, levelId, name, coefficient } = req.body;
        const newSubject = { name, coefficient: parseFloat(coefficient) };

        const subject = Academic.addSubject(streamId, levelId, newSubject);
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Classes
// @route   GET /api/academic/classes
// @access  Private
exports.getClasses = async (req, res) => {
    try {
        const classes = SchoolClass.getAll();
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a Class
// @route   POST /api/academic/classes
// @access  Private/Admin
exports.createClass = async (req, res) => {
    try {
        const { name, levelId, streamId, mainTeacherId } = req.body;

        const newClass = SchoolClass.create({
            name,
            levelId,
            streamId,
            mainTeacherId // Principal teacher (Professeur Principal)
        });
        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign Teacher to Subject in Class (Create Course)
// @route   POST /api/academic/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
    try {
        const { classId, subjectName, teacherId, streamId, levelId } = req.body;

        const newCourse = Course.create({
            classId,
            subjectName,
            teacherId,
            streamId,
            levelId
        });
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Courses for a Teacher
// @route   GET /api/academic/courses/teacher/:teacherId
// @access  Private (Teacher or Admin)
exports.getTeacherCourses = async (req, res) => {
    try {
        const { teacherId } = req.params;
        // Check if requesting user is the teacher or admin
        if (req.user.role !== 'ADMIN' && req.user.id !== teacherId) {
            // Access denied logic can be here, but for now we rely on route protection
            // Wait, if I am a teacher, I should only see my courses.
            // The middleware checks role, but validation against ID is good here.
        }

        // If regular user trying to access other's data
        if (req.user.role !== 'ADMIN' && req.user.id !== teacherId) {
            return res.status(403).json({ message: 'Not authorized to view these courses' });
        }

        const courses = Course.findByTeacher(teacherId);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add Student to Class
// @route   POST /api/academic/classes/:classId/students
// @access  Private/Admin
exports.addStudentToClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { studentId } = req.body;

        const classes = SchoolClass.getClasses();
        const schoolClass = classes.find(c => c.id === classId);

        if (!schoolClass) return res.status(404).json({ message: 'Class not found' });

        if (!schoolClass.students.includes(studentId)) {
            schoolClass.students.push(studentId);
            SchoolClass.saveClasses(classes);
        }

        res.json(schoolClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
