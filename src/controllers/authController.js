
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user (Staff or Parent)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        // Allowed roles for public registration: USER (Staff) or PARENT
        if (role && !['USER', 'PARENT'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role for registration' });
        }

        // Default to USER if not specified
        const userRole = role || 'USER';

        const profilePhoto = req.file ? req.file.path : null;

        const userData = {
            firstName,
            lastName,
            email,
            password,
            role: userRole,
            profilePhoto,
            isActive: true // Default active
        };

        const existingUser = User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = await User.create(userData);

        res.status(201).json({
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role,
            token: generateToken(newUser.id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = User.findByEmail(email);

        if (user && (await bcrypt.compare(password, user.password))) {
            // Re-attach password for internal check if needed, but User.findByEmail returns object with password property but we stripped it in findById? 
            // Wait, findByEmail in User.js returns the full object including password for auth check? 
            // Let's check User.js logic. 
            // User.js findByEmail returns raw object. Yes.

            res.json({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profilePhoto: user.profilePhoto,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Setup Admin (One-time use)
// @route   POST /api/auth/setup-admin
// @access  Public
exports.setupAdmin = async (req, res) => {
    try {
        const existingAdmin = User.findAdmin();
        if (existingAdmin) {
            return res.status(403).json({ message: 'Admin already exists' });
        }

        const { firstName, lastName, email, password } = req.body;
        const profilePhoto = req.file ? req.file.path : null;

        const adminData = {
            firstName,
            lastName,
            email,
            password,
            role: 'ADMIN',
            profilePhoto,
            isActive: true
        };

        const newAdmin = await User.create(adminData);

        res.status(201).json({
            id: newAdmin.id,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            email: newAdmin.email,
            role: newAdmin.role,
            token: generateToken(newAdmin.id),
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    const user = User.findById(req.user.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
