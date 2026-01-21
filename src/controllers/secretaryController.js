
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const SchoolClass = require('../models/SchoolClass');
const Bulletin = require('../models/Bulletin');

// @desc    Import Students from Excel
// @route   POST /api/secretary/import-students
// @access  Private (Secretaire, Admin)
exports.importStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const results = {
            success: 0,
            errors: []
        };

        for (const row of data) {
            // Expected columns: FirstName, LastName, Email, ClassName
            try {
                // 1. Create Student User
                const email = row.Email || `${row.FirstName}.${row.LastName}@school.com`.toLowerCase();
                const password = 'password123'; // Default password

                let student = User.findByEmail(email);
                if (!student) {
                    student = await User.create({
                        firstName: row.FirstName,
                        lastName: row.LastName,
                        email: email,
                        password: password,
                        role: 'ELEVE'
                    });
                }

                // 2. Assign to Class
                if (row.ClassName) {
                    const classes = SchoolClass.getAll();
                    const targetClass = classes.find(c => c.name === row.ClassName);
                    if (targetClass) {
                        // Avoid duplicates
                        if (!targetClass.students.includes(student.id)) {
                            targetClass.students.push(student.id);
                            SchoolClass.saveClasses(classes);
                        }
                    } else {
                        results.errors.push(`Class ${row.ClassName} not found for student ${row.FirstName}`);
                    }
                }

                results.success++;
            } catch (error) {
                results.errors.push(`Failed to import ${row.FirstName}: ${error.message}`);
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate Bulletin PDF
// @route   GET /api/secretary/bulletins/:studentId/pdf
// @access  Private (Secretaire, Admin, Parent, Eleve)
exports.generateBulletinPDF = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { period } = req.query;

        // Find Validated Bulletin
        const bulletins = Bulletin.findByStudent(studentId);
        const bulletin = bulletins.find(b => b.period === period && b.status === 'VALIDATED');

        if (!bulletin) {
            return res.status(404).json({ message: 'Bulletin not found or not validated' });
        }

        const doc = new PDFDocument();

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=bulletin_${studentId}_${period}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('BULLETIN SCOLAIRE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Student: ${bulletin.studentName}`);
        doc.text(`Class: ${bulletin.className}`);
        doc.text(`Period: ${bulletin.period}`);
        doc.moveDown();

        // Table Header
        doc.fontSize(12).text('Subject', 50, 200);
        doc.text('Avg', 300, 200);
        doc.text('Coeff', 350, 200);
        doc.text('Points', 400, 200);
        doc.moveDown();

        let y = 220;
        bulletin.data.subjectAverages.forEach(subj => {
            doc.text(subj.subject, 50, y);
            doc.text(subj.average, 300, y);
            doc.text(subj.coefficient, 350, y);
            doc.text(subj.points, 400, y);
            y += 20;
        });

        doc.moveDown();
        doc.fontSize(14).text(`General Average: ${bulletin.data.generalAverage}`, 50, y + 20);

        doc.end();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Archives
// @route   GET /api/secretary/archive
// @access  Private (Secretaire)
exports.getArchives = async (req, res) => {
    // Mock Archive Data
    res.json([
        { year: '2023-2024', studentCount: 150, classCount: 10 },
        { year: '2022-2023', studentCount: 145, classCount: 10 }
    ]);
};
