const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendActivationEmail = async (to, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const activationLink = `${frontendUrl}/activate/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Activate Your Sanraw Account',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #2E8B57;">Welcome to Sanraw!</h2>
                <p>Please click the button below to activate your account:</p>
                <a href="${activationLink}" style="display: inline-block; padding: 10px 20px; background-color: #2E8B57; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Activate Account</a>
                <p style="margin-top: 20px; font-size: 12px; color: #777;">This link expires in 24 hours.</p>
                <p style="font-size: 12px; color: #777;">Or copy this link: ${activationLink}</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Activation email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send activation email');
    }
};

module.exports = { sendActivationEmail };
