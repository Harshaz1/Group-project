const userModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/hash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');

const login = async (email, password) => {
    const user = await userModel.findUserByEmail(email);
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    // Record Login History
    await userModel.logLogin(user.id);

    return { token, user: { id: user.id, email: user.email, role: user.role } };
};

const changePassword = async (email, currentPassword, newPassword) => {
    const user = await userModel.findUserByEmail(email);
    if (!user) {
        throw new Error('account is not exist');
    }

    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
        throw new Error('Invalid current password');
    }

    const hashedPassword = await hashPassword(newPassword);
    await userModel.updatePassword(user.id, hashedPassword);

    return { message: 'Password changed successfully' };
};

const signup = async (userData) => {
    // Check if user exists
    const existingUser = await userModel.findUserByEmail(userData.email);
    if (existingUser) {
        throw new Error('User already exists');
    }

    // Hash password
    const password_hash = await hashPassword(userData.password);

    // Create user with active status directly
    await userModel.createUser({
        ...userData,
        password_hash,
        status: 'active',
        activation_token: null,
        activation_expires: null
    });

    return { message: 'User registered successfully' };
};

const activateAccount = async (token) => {
    // Find user by token
    const [rows] = await db.query(
        'SELECT * FROM user WHERE activation_token = ? AND activation_expires > NOW()',
        [token]
    );

    if (rows.length === 0) {
        throw new Error('Invalid or expired activation token');
    }

    const user = rows[0];

    // Activate user
    await db.query(
        'UPDATE user SET status = ?, activation_token = NULL, activation_expires = NULL WHERE id = ?',
        ['active', user.id]
    );

    return { message: 'Account activated successfully' };
};

module.exports = {
    login,
    signup,
    changePassword,
    activateAccount
};
