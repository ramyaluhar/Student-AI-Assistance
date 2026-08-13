// utils/sendEmail.js
const nodemailer = require('nodemailer');
const dns = require('dns');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Force IPv4 resolution directly at the DNS lookup level —
  // more reliable than the 'family' option on some Node versions.
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  },
  connectionTimeout: 15000,
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