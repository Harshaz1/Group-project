const pool = require('../config/db');

const createUser = async (userData) => {
    const { first_name, last_name, email, password_hash, role, status, activation_token, activation_expires } = userData;
    const [result] = await pool.query(
        'INSERT INTO user (first_name, last_name, email, password_hash, role, status, activation_token, activation_expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [first_name, last_name, email, password_hash, role, status || 'inactive', activation_token, activation_expires]
    );
    return result.insertId;
};

const findUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
    return rows[0];
};

const findUserById = async (id) => {
    const [rows] = await pool.query('SELECT id, first_name, last_name, email, role, profile_image, phone_number, recovery_email, status, created_at FROM user WHERE id = ?', [id]);
    return rows[0];
};

const getAllUsers = async () => {
    const [rows] = await pool.query('SELECT id, first_name, last_name, email, role, profile_image, phone_number, recovery_email, status, created_at FROM user');
    return rows;
};

const updateUser = async (id, userData) => {
    const { first_name, last_name, role, phone_number, recovery_email, profile_image, status } = userData;
    // Build dynamic query
    let fields = [];
    let params = [];

    if (first_name !== undefined) {
        fields.push('first_name = ?');
        params.push(first_name);
    }
    if (last_name !== undefined) {
        fields.push('last_name = ?');
        params.push(last_name);
    }
    if (role !== undefined) {
        fields.push('role = ?');
        params.push(role);
    }
    if (phone_number !== undefined) {
        fields.push('phone_number = ?');
        params.push(phone_number);
    }
    if (profile_image !== undefined) {
        fields.push('profile_image = ?');
        params.push(profile_image);
    }
    if (recovery_email !== undefined) {
        fields.push('recovery_email = ?');
        params.push(recovery_email);
    }
    if (status !== undefined) {
        fields.push('status = ?');
        params.push(status);
    }

    if (fields.length === 0) return; // Nothing to update

    const query = `UPDATE user SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);

    await pool.query(query, params);
};

const deleteUser = async (id) => {
    await pool.query('DELETE FROM user WHERE id = ?', [id]);
};

const updatePassword = async (id, newPasswordHash) => {
    await pool.query('UPDATE user SET password_hash = ? WHERE id = ?', [newPasswordHash, id]);
};

const logLogin = async (userId) => {
    const query = 'INSERT INTO login_history (user_id) VALUES (?)';
    const [result] = await pool.query(query, [userId]);
    return result.insertId;
};

const logLogout = async (userId) => {
    // Updates the latest login record that doesn't have a logout time
    const query = `
        UPDATE login_history 
        SET logout_time = CURRENT_TIMESTAMP 
        WHERE user_id = ? AND logout_time IS NULL 
        ORDER BY login_time DESC LIMIT 1
    `;
    await pool.query(query, [userId]);
};

const getLoginHistory = async (userId) => {
    const query = 'SELECT * FROM login_history WHERE user_id = ? ORDER BY login_time DESC';
    const [rows] = await pool.query(query, [userId]);
    return rows;
};

const deleteLoginHistory = async (id, userId) => {
    const query = 'DELETE FROM login_history WHERE id = ? AND user_id = ?';
    await pool.query(query, [id, userId]);
};

const clearLoginHistory = async (userId) => {
    const query = 'DELETE FROM login_history WHERE user_id = ?';
    await pool.query(query, [userId]);
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    updatePassword,
    logLogin,
    logLogout,
    getLoginHistory,
    deleteLoginHistory,
    clearLoginHistory
};
