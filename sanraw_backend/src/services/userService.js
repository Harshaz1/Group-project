const userModel = require('../models/userModel');
const { hashPassword } = require('../utils/hash');
const crypto = require('crypto');
// const { sendActivationEmail } = require('../utils/emailService');

const createUser = async (userData) => {
    const { password } = userData;
    const password_hash = await hashPassword(password);

    // Create user with active status directly
    const userId = await userModel.createUser({
        ...userData,
        password_hash,
        status: 'active',
        activation_token: null,
        activation_expires: null
    });

    return userId;
};

const getAllUsers = async () => {
    return await userModel.getAllUsers();
};

const getUserById = async (id) => {
    return await userModel.findUserById(id);
};

const updateUser = async (id, userData) => {
    const updateData = { ...userData };
    
    // If a new password is provided, hash it before saving
    if (updateData.password) {
        updateData.password_hash = await hashPassword(updateData.password);
        delete updateData.password; // Remove plain text password
    }

    await userModel.updateUser(id, updateData);
    return { message: 'User updated' };
};

const deleteUser = async (id) => {
    await userModel.deleteUser(id);
    return { message: 'User deleted' };
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getLoginHistory: userModel.getLoginHistory,
};
