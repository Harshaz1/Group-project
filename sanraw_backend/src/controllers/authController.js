const authService = require('../services/authService');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }
        const result = await authService.login(username, password);
        res.json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

const signup = async (req, res) => {
    try {
        const { first_name, last_name, username, password, confirmPassword } = req.body;

        if (!first_name || !last_name || !username || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        await authService.signup({ first_name, last_name, username, password, role: 'employee' });
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

// const logout = async (req, res) => {
//     try {
//         if (req.user && req.user.id) {
//             const userModel = require('../models/userModel');
//             await userModel.logLogout(req.user.id);
//         }
//         res.json({ message: 'Logged out successfully' });
//     } catch (err) {
//         res.status(500).json({ message: 'Error logging out' });
//     }
// };
const logout = async (req, res) => {
    try {
        const userId = req.user.id; // From verifyToken middleware
        
        // 1. Record in DB first
        await userModel.logLogout(userId);
        
        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const changePassword = async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;
        if (!username || !currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Username, current password, and new password are required' });
        }
        await authService.changePassword(username, currentPassword, newPassword);
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
