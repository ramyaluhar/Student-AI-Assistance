// services/emailService.js
// Sends OTP emails for registration verification and password reset.

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, otp, purpose = 'registration') => {
  const isReset = purpose === 'reset';

  const subject = isReset
    ? 'Password Reset OTP - AI Student Assistant'
    : 'Email Verification OTP - AI Student Assistant';

  const title = isReset
    ? 'Reset Your Password'
    : 'Verify Your Email';

  const message = isReset
    ? 'Use the OTP below to reset your AI Student Assistant password.'
    : 'Use the OTP below to verify your email address and complete your registration.';

  const mailOptions = {
    from: `"AI Student Assistant" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: auto;
        padding: 30px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
      ">

        <h2 style="margin-bottom: 8px;">
          ${title}
        </h2>

        <p style="color: #6b7280;">
          ${message}
        </p>

        <div style="
          margin: 25px 0;
          padding: 18px;
          text-align: center;
          background: #f3f4f6;
          border-radius: 10px;
        ">

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
          ">
            ${otp}
          </div>

        </div>

        <p style="color: #6b7280;">
          This OTP is valid for <strong>10 minutes</strong>.
        </p>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 25px;">
          If you did not request this, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">

        <p style="font-size: 12px; color: #9ca3af;">
          AI Student Assistant
        </p>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };