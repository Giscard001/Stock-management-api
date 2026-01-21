
const Grade = require('../models/Grade');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Academic = require('../models/Academic');

// Calculate Subject Average for a Student
const calculateSubjectAverage = (studentId, courseId, period) => {
    // 1. Get all assignments for this course
    const assignments = Assignment.findByCourse(courseId);

    // Filter by period if applicable (assuming assignments have dates or period tags)
    // For now, simple average of all valid grades

    const grades = Grade.findByStudent(studentId);

    let totalWeightedScore = 0;
    let totalWeight = 0;

    assignments.forEach(assignment => {
        // Find grade for this assignment
        const grade = grades.find(g => g.assignmentId === assignment.id);

        // Only count validated grades? Or all? "Calcul automatique dès saisie" implies all.
        // But for official bulletins, usually only Validated.
        // Let's use strict mode: only if grade exists.

        if (grade && grade.value !== undefined) {
            const weight = assignment.weight || 1;
            totalWeightedScore += parseFloat(grade.value) * weight;
            totalWeight += weight;
        }
    });

    if (totalWeight === 0) return null; // No grades
    return (totalWeightedScore / totalWeight).toFixed(2);
};

// Calculate General Average (Moyenne Générale)
const calculateGeneralAverage = async (studentId, classId, period) => {
    // 1. Get all courses for the class
    const courses = Course.getAll().filter(c => c.classId === classId);

    // 2. Get Academic Structure to find Coefficients
    const structure = Academic.getData();
    // We need to find the coefficient for each subject in this class's level/stream.
    // This requires looking up the stream/level from Class -> Academic.

    // For MVP, allow Course to store coefficient? Or look it up.
    // Let's assume we can look it up or pass it provided.

    // Let's do a simplified version where we iterate courses.

    let totalPoints = 0;
    let totalCoeffs = 0;
    const subjectAverages = [];

    for (const course of courses) {
        const avg = calculateSubjectAverage(studentId, course.id, period);
        if (avg !== null) {
            // Find Coefficient
            // Logic to find coeff from Academic...
            // Optimization: Maybe Course has cached coefficient?
            // For now, use 1 or find it.
            let coeff = 1;

            // Look up in Academic
            structure.streams.forEach(stream => {
                stream.levels.forEach(level => {
                    const subject = level.subjects.find(s => s.name === course.subjectName);
                    if (subject) coeff = subject.coefficient;
                });
            });

            const points = parseFloat(avg) * coeff;
            totalPoints += points;
            totalCoeffs += coeff;

            subjectAverages.push({
                subject: course.subjectName,
                average: avg,
                coefficient: coeff,
                points: points.toFixed(2)
            });
        }
    }

    const generalAverage = totalCoeffs > 0 ? (totalPoints / totalCoeffs).toFixed(2) : null;

    return {
        studentId,
        period,
        subjectAverages,
        generalAverage,
        totalPoints: totalPoints.toFixed(2),
        totalCoeffs
    };
};

module.exports = { calculateSubjectAverage, calculateGeneralAverage };
