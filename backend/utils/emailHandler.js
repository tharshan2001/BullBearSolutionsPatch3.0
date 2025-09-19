import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT), // ensure it's a number
  secure: false, // use TLS for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // must be the 16-char app password
  },
});

// Verify SMTP connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP configuration error:', err);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

/**
 * Send email function
 * @param {Object} param0
 * @param {string} param0.to - Recipient email
 * @param {string} param0.subject - Email subject
 * @param {string} param0.html - HTML content
 * @param {Array} param0.attachments - Optional attachments
 */
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const mailOptions = {
    from: `"BB Solution" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('Error sending email:', err);
    throw err; // propagate error to caller
  }
};
