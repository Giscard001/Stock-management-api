
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/classes.json');

class SchoolClass {
    static getClasses() {
        if (!fs.existsSync(dataPath)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    static saveClasses(classes) {
        fs.writeFileSync(dataPath, JSON.stringify(classes, null, 2));
    }

    static create(classData) {
        const classes = this.getClasses();
        // data: { name: "6eme A", levelId: "6eme", streamId: "general", mainTeacherId: "...", students: [] }
        const newClass = {
            id: Date.now().toString(),
            students: [],
            ...classData
        };
        classes.push(newClass);
        this.saveClasses(classes);
        return newClass;
    }

    static getAll() {
        return this.getClasses();
    }

    static findById(id) {
        return this.getClasses().find(c => c.id === id);
    }
}

module.exports = SchoolClass;
