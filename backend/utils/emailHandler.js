import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,  
  port: process.env.SMTP_PORT,  
  secure: false,                
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,  
  },
});

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const mailOptions = {
    from: `"BB Solution" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments,  
  };

  await transporter.sendMail(mailOptions);
};
