const db = require('../config/db');
const { sendOtpEmail } = require('../utils/emailService');

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const createOtp = async (email) => {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete existing OTPs for this email
    await db.query('DELETE FROM otp_verification WHERE email = ?', [email]);

    // Save new OTP
    await db.query('INSERT INTO otp_verification (email, otp_code, expires_at) VALUES (?, ?, ?)', 
        [email, otp, expiresAt]);

    // Send Email
    await sendOtpEmail(email, otp);

    return otp;
};

const verifyOtp = async (email, otp) => {
    const [rows] = await db.query(
        'SELECT * FROM otp_verification WHERE email = ? AND otp_code = ? AND expires_at > NOW()',
        [email, otp]
    );

    if (rows.length > 0) {
        // OTP valid, delete it
        await db.query('DELETE FROM otp_verification WHERE email = ?', [email]);
        return true;
    }
    return false;
};

module.exports = { createOtp, verifyOtp };
