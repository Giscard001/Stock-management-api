
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataPath = path.join(__dirname, '../data/users.json');

class User {
    static getUsers() {
        if (!fs.existsSync(dataPath)) {
            return [];
        }
        const data = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(data || '[]');
    }

    static saveUsers(users) {
        fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
    }

    static async create(userData) {
        const users = this.getUsers();

        // Check for uniqueness
        if (users.find(u => u.email === userData.email)) {
            throw new Error('Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const newUser = {
            id: Date.now().toString(),
            ...userData,
            password: hashedPassword,
            childrenIds: [], // For Parents
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);

        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    static findByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email === email);
    }

    static findById(id) {
        const users = this.getUsers();
        const user = users.find(u => u.id === id);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    static findAdmin() {
        const users = this.getUsers();
        return users.find(u => u.role === 'ADMIN');
    }

    static updateRole(id, newRole) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;

        users[index].role = newRole;
        this.saveUsers(users);

        const { password, ...userWithoutPassword } = users[index];
        return userWithoutPassword;
    }

    static addChild(parentId, childId) {
        const users = this.getUsers();
        const parentIndex = users.findIndex(u => u.id === parentId);

        if (parentIndex === -1) return null;

        if (!users[parentIndex].childrenIds) {
            users[parentIndex].childrenIds = [];
        }

        if (!users[parentIndex].childrenIds.includes(childId)) {
            users[parentIndex].childrenIds.push(childId);
            this.saveUsers(users);
        }

        return users[parentIndex];
    }
}

module.exports = User;
