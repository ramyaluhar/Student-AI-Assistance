// utils/sendEmail.js
// Sends emails using Brevo's HTTP API (avoids Render's SMTP port issues entirely).

const sendEmail = async ({ to, subject, text, html }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: 'AI Student Assistant',
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Brevo API error: ${response.status}`);
  }

  return response.json();
};

module.exports = sendEmail;