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
    await userModel.updateUser(id, userData);
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
    deleteLoginHistory: userModel.deleteLoginHistory,
    clearLoginHistory: userModel.clearLoginHistory
};
