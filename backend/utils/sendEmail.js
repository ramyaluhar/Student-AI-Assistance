// utils/sendEmail.js
// Sends emails using Resend HTTPS API.

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
  await resend.emails.send({
    from: 'StudentGenie <onboarding@resend.dev>',
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;