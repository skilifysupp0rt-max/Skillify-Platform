const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass'
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.warn('⚠️ SMTP Connection Failed:', error.message);
        console.warn('Email features may not work. Check .env variables.');
    } else {
        console.log('✅ SMTP Server is ready to take our messages');
    }
});

exports.sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Skillify Team" <no-reply@skillify.com>',
            to,
            subject,
            html
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

exports.sendOtpEmail = async (to, otp) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">🔐 Verification Code</h2>
            <p style="color: #555;">Use the following code to verify your email address. This code will expire in 10 minutes.</p>
            <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #000;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
    `;
    return exports.sendEmail(to, 'Skillify Verification Code', html);
};
