// Test SendGrid Email - Uses environment variables
require('dotenv').config();
const axios = require('axios');
const nodemailer = require('nodemailer');

// Get API key from environment
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM = process.env.EMAIL_USER || "skilifysupp0rt@gmail.com";
const TO = process.env.EMAIL_USER || "skilifysupp0rt@gmail.com";

if (!SENDGRID_API_KEY) {
    console.log("⚠️ SENDGRID_API_KEY not found in .env file");
    console.log("Add this to your .env file:");
    console.log("SENDGRID_API_KEY=your_sendgrid_api_key_here");
    process.exit(1);
}

axios.post(
    "https://api.sendgrid.com/v3/mail/send",
    {
        personalizations: [{ to: [{ email: TO }] }],
        from: { email: FROM },
        subject: "Test from SendGrid",
        content: [{ type: "text/plain", value: "Hello! Test message working fine ✅" }]
    },
    {
        headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
        },
    }
).then(() => {
    console.log("✅ Email sent successfully via SendGrid");
}).catch(err => {
    console.error("❌ SendGrid Error:", err.response?.status, err.response?.data || err.message);
});

// Brevo SMTP Test (also uses .env)
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.BREVO_USER || 'your_brevo_username',
        pass: process.env.BREVO_PASS || 'your_brevo_password'
    }
});

transporter.sendMail({
    from: FROM,
    to: TO,
    subject: 'Test Email from Skillify',
    text: 'This is a test email from Brevo SMTP setup.'
}, (error, info) => {
    if (error) {
        return console.log('❌ Brevo Error:', error.message);
    }
    console.log('✅ Email sent via Brevo:', info.response);
});
