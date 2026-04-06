'use strict';

const nodemailer = require('nodemailer');
const logger = require('./logger');

const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Samba Service" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  logger.info(`Email sent to ${to}: ${info.messageId}`);
  return info;
};

module.exports = { sendEmail };
