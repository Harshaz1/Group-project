const authService = require('../services/authService');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }
        const result = await authService.login(email, password);
        res.json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

const signup = async (req, res) => {
    try {
        const { first_name, last_name, email, password, confirmPassword } = req.body;

        if (!first_name || !last_name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        await authService.signup({ first_name, last_name, email, password, role: 'employee' });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const activateAccount = async (req, res) => {
    try {
        const { token } = req.params;
        const result = await authService.activateAccount(token);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const logout = async (req, res) => {
    try {
        if (req.user && req.user.id) {
            const userModel = require('../models/userModel');
            await userModel.logLogout(req.user.id);
        }
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error logging out' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Email, current password, and new password are required' });
        }
        await authService.changePassword(email, currentPassword, newPassword);
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    login,
    signup,
    activateAccount,
    changePassword,
    logout
};
