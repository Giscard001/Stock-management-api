
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/grades.json');

class Grade {
    static getAll() {
        if (!fs.existsSync(dataPath)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    static save(grades) {
        fs.writeFileSync(dataPath, JSON.stringify(grades, null, 2));
    }

    static createOrUpdate(data) {
        const grades = this.getAll();
        const { studentId, assignmentId, value, comment, authorId } = data;

        const existingIndex = grades.findIndex(g => g.studentId === studentId && g.assignmentId === assignmentId);

        if (existingIndex !== -1) {
            // Update
            const oldGrade = grades[existingIndex];
            grades[existingIndex] = {
                ...oldGrade,
                value,
                comment,
                updatedAt: new Date().toISOString(),
                history: [
                    ...(oldGrade.history || []),
                    {
                        value: oldGrade.value,
                        updatedAt: oldGrade.updatedAt || oldGrade.createdAt,
                        authorId: oldGrade.authorId
                    }
                ],
                lastAuthorId: authorId
            };
            this.save(grades);
            return grades[existingIndex];
        } else {
            // Create
            const newGrade = {
                id: Date.now().toString(),
                studentId,
                assignmentId,
                value,
                comment,
                createdAt: new Date().toISOString(),
                authorId, // Original author
                status: 'PENDING', // For validation
                history: []
            };
            grades.push(newGrade);
            this.save(grades);
            return newGrade;
        }
    }

    static findByAssignment(assignmentId) {
        return this.getAll().filter(g => g.assignmentId === assignmentId);
    }

    static findByStudent(studentId) {
        return this.getAll().filter(g => g.studentId === studentId);
    }
}

module.exports = Grade;
