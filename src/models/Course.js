
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/courses.json');

class Course {
    static getAll() {
        if (!fs.existsSync(dataPath)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    static save(courses) {
        fs.writeFileSync(dataPath, JSON.stringify(courses, null, 2));
    }

    static create(courseData) {
        const courses = this.getAll();
        // courseData: { classId, subjectName, teacherId, streamId, levelId }
        const newCourse = {
            id: Date.now().toString(),
            ...courseData
        };
        courses.push(newCourse);
        this.save(courses);
        return newCourse;
    }

    static findByTeacher(teacherId) {
        const courses = this.getAll();
        return courses.filter(c => c.teacherId === teacherId);
    }
}

module.exports = Course;
