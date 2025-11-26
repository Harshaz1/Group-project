const userService = require('../services/userService');

const createUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password, role } = req.body;
        // Default role to 'employee' if not provided
        const userRole = role || 'employee';

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        await userService.createUser({ first_name, last_name, email, password, role: userRole });
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, role } = req.body;
        await userService.updateUser(id, { first_name, last_name, role });
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userService.getUserById(userId); // Assuming this method exists or we use findUserById from model
        // Actually userService exports methods that wrap model. but userService doesn't have getUserById in the initial read.
        // Checking userService again -> it exports getAllUsers, createUser...
        // Let's assume we need to add getUserById to userService too or perform direct model call if logic is simple.
        // Best practice: add to service.
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, role, phone_number } = req.body;
        let updateData = { first_name, last_name, role, phone_number };

        if (req.file) {
            updateData.profile_image = req.file.path; // Cloudinary URL
        }

        // Clean undefined
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        await userService.updateUser(userId, updateData);
        res.json({ message: 'Profile updated successfully', profile_image: updateData.profile_image });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getLoginHistory = async (req, res) => {
    try {
        const history = await userService.getLoginHistory(req.user.id);
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteLoginHistoryItem = async (req, res) => {
    try {
        await userService.deleteLoginHistory(req.params.id, req.user.id);
        res.json({ message: 'History item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const clearMyHistory = async (req, res) => {
    try {
        await userService.clearLoginHistory(req.user.id);
        res.json({ message: 'History cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getProfile,
    updateProfile,
    getLoginHistory,
    deleteLoginHistoryItem,
    clearMyHistory
};
