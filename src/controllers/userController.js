
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = User.getUsers();
        // Remove passwords
        const safeUsers = users.map(user => {
            const { password, ...rest } = user;
            return rest;
        });
        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update User Role (Upgrade Staff)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const validRoles = ['ADMIN', 'PROFESSEUR', 'CENSEUR', 'PROVISEUR', 'SECRETAIRE', 'PARENT', 'ELEVE', 'USER'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const updatedUser = User.updateRole(id, role);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete User
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = User.delete(id); // Assuming model has delete
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get System Logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getSystemLogs = async (req, res) => {
    // Mock implementation
    res.json([
        { id: 1, action: 'LOGIN', user: 'admin@school.com', timestamp: new Date() },
        { id: 2, action: 'GRADE_UPDATE', user: 'prof@school.com', timestamp: new Date() }
    ]);
};
