
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/bulletins.json');

class Bulletin {
    static getAll() {
        if (!fs.existsSync(dataPath)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    static save(bulletins) {
        fs.writeFileSync(dataPath, JSON.stringify(bulletins, null, 2));
    }

    static create(data) {
        const bulletins = this.getAll();
        // Check if already exists for student+period
        const existingIndex = bulletins.findIndex(b => b.studentId === data.studentId && b.period === data.period);

        const newBulletin = {
            id: Date.now().toString(),
            validatedAt: new Date().toISOString(),
            ...data
        };

        if (existingIndex !== -1) {
            bulletins[existingIndex] = newBulletin;
        } else {
            bulletins.push(newBulletin);
        }

        this.save(bulletins);
        return newBulletin;
    }

    static findByStudent(studentId) {
        return this.getAll().filter(b => b.studentId === studentId);
    }
}

module.exports = Bulletin;
