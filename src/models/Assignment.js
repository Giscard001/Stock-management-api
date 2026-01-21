
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/assignments.json');

class Assignment {
    static getAll() {
        if (!fs.existsSync(dataPath)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    static save(assignments) {
        fs.writeFileSync(dataPath, JSON.stringify(assignments, null, 2));
    }

    static create(data) {
        const assignments = this.getAll();
        const newAssignment = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            weight: 1, // Default weight
            ...data
        };
        assignments.push(newAssignment);
        this.save(assignments);
        return newAssignment;
    }

    static findByCourse(courseId) {
        return this.getAll().filter(a => a.courseId === courseId);
    }

    static findById(id) {
        return this.getAll().find(a => a.id === id);
    }
}

module.exports = Assignment;
