// utils/sendEmail.js
// Sends OTP emails using Gmail SMTP.

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4, // force IPv4 - avoids Render's IPv6 ENETUNREACH/ETIMEDOUT issue
  connectionTimeout: 15000, // 15s to establish connection
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

const sendEmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `"AI Student Assistant" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;