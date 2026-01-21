
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
let adminToken, teacherToken, parentToken, studentToken;
let studentId, teacherId, classId, courseId, assignmentId;

const log = (msg) => console.log(`[TEST] ${msg}`);

async function run() {
    try {
        log('Starting Verification...');

        // 1. Setup Admin
        try {
            const res = await axios.post(`${API_URL}/auth/setup-admin`, {
                firstName: 'Admin', lastName: 'User', email: 'admin@school.com', password: 'password123'
            });
            adminToken = res.data.token;
            log('Admin Setup Success');
        } catch (e) {
            log('Admin already exists, logging in...');
            const res = await axios.post(`${API_URL}/auth/login`, { email: 'admin@school.com', password: 'password123' });
            adminToken = res.data.token;
        }

        // 2. Create Users (Teacher, Parent, Student) via Register or Admin
        // Actually Student usually imported, Teacher upgraded.
        // Let's use Register for Teacher/Parent and Import for Student (or Register Student for simplicity here)

        // Register Teacher
        try {
            await axios.post(`${API_URL}/auth/register`, { firstName: 'Prof', lastName: 'X', email: 'prof@school.com', password: 'password123', role: 'USER' });
        } catch (e) { } // Ignore if exists
        const resTeacher = await axios.post(`${API_URL}/auth/login`, { email: 'prof@school.com', password: 'password123' });
        teacherToken = resTeacher.data.token;
        teacherId = resTeacher.data.id;

        // Upgrade Teacher Role
        await axios.put(`${API_URL}/users/${teacherId}/role`, { role: 'PROFESSEUR' }, { headers: { Authorization: `Bearer ${adminToken}` } });
        log('Teacher Setup Success');

        // Register Parent
        try {
            await axios.post(`${API_URL}/auth/register`, { firstName: 'Parent', lastName: 'A', email: 'parent@school.com', password: 'password123', role: 'PARENT' });
        } catch (e) { }
        const resParent = await axios.post(`${API_URL}/auth/login`, { email: 'parent@school.com', password: 'password123' });
        parentToken = resParent.data.token;
        log('Parent Setup Success');

        // Create Student (mocking import by direct Model access or Register if we allowed it, Auth register allows USER/PARENT)
        // Let's import via Secretary route or just manually create one via Register (if we allow ELEVE role? No, only USER/PARENT public)
        // So Admin needs to create student or Secretary import.
        // We'll use Secretary Import Mock.
        // Or simpler: register as USER, upgrade to ELEVE by Admin.
        try {
            await axios.post(`${API_URL}/auth/register`, { firstName: 'Student', lastName: 'One', email: 'student@school.com', password: 'password123', role: 'USER' });
        } catch (e) { }
        const resStudent = await axios.post(`${API_URL}/auth/login`, { email: 'student@school.com', password: 'password123' });
        studentId = resStudent.data.id;
        studentToken = resStudent.data.token;
        await axios.put(`${API_URL}/users/${studentId}/role`, { role: 'ELEVE' }, { headers: { Authorization: `Bearer ${adminToken}` } });
        log('Student Setup Success');

        // 3. Admin Config (Academic)
        // Create Class
        const resClass = await axios.post(`${API_URL}/academic/classes`, {
            name: '3eme A', levelId: '3eme', streamId: 'general', mainTeacherId: teacherId
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        classId = resClass.data.id;
        log(`Class Created: ${classId}`);

        // Assign Student to Class (Manual Hack: Update Class)
        // We need a route to add student to class! 
        // I missed "Add Student to Class" endpoint in Admin! 
        // Import handles it. Let's use Import logic or just update JSON manually? 
        // Agent: "I should probably fix this in Admin Controller if I have time, but verification script can't fix code."
        // Actually, I can use the Secretary Import to do it properly.
        // ... or I can just assume the Student was added to class during Import.
        // Let's skip class assignment verification for a moment and assume I can fix the JSON or use a quick script.
        // Wait, `importStudents` does: `targetClass.students.push(student.id)`.
        // So I'll create a fake CSV/XLS for import test? Too complex for this script.
        // I'll add an endpoint or use an existing one. 
        // Ah, `SchoolClass.saveClasses` is internal.
        // I will rely on my manual code inspection OR logic.
        // Let's assume for this test, I will manually add the student to the class using a temporary admin route or direct JSON edit if I could...
        // But I can't from here.
        // OK, I will add `addStudentToClass` to `academicController` as it is essential for Admin.

        // 4. Create Course
        const resCourse = await axios.post(`${API_URL}/academic/courses`, {
            classId, subjectName: 'Maths', teacherId, streamId: 'general', levelId: '3eme'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        courseId = resCourse.data.id;
        log(`Course Created: ${courseId}`);

        // 5. Professor Flow
        // Create Assignment
        const resAssign = await axios.post(`${API_URL}/professor/assignments`, {
            courseId, title: 'Exam 1', type: 'DEVOIR', date: '2025-10-10', maxScore: 20
        }, { headers: { Authorization: `Bearer ${teacherToken}` } });
        assignmentId = resAssign.data.id;
        log(`Assignment Created: ${assignmentId}`);

        // Enter Grade
        await axios.post(`${API_URL}/professor/grades`, {
            assignmentId, studentId, value: 15, comment: 'Good job'
        }, { headers: { Authorization: `Bearer ${teacherToken}` } });
        log('Grade Entered');

        // 6. Censeur/Proviseur Flow
        // Validate Grade seems optional for calculation, but keeping it validated is good.
        // Let's skip explicit censeur validation to test "Calcul automatique".

        // 7. Calculate/Generate Bulletin
        // Needed: Student must be in Class.
        // NOTE: Since I didn't add student to class successfully via API above (missing route), this might fail.
        // Fix: I will update `academicController.js` to add `addStudentToClass`.

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

run();
