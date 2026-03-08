const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

// POST /api/feedback
router.post('/', async (req, res) => {
  const { subject, message, fromEmail, fromName } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // Build transport from env vars (supports Gmail or any SMTP provider)
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);

  if (!smtpUser || !smtpPass) {
    console.warn('Feedback received but SMTP not configured — logging to console.');
    console.log('--- FEEDBACK ---');
    console.log('From:', fromName || 'Anonymous', fromEmail ? `<${fromEmail}>` : '');
    console.log('Subject:', subject || '(no subject)');
    console.log('Message:', message);
    console.log('----------------');
    return res.json({ success: true });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const senderLabel = [fromName, fromEmail ? `<${fromEmail}>` : ''].filter(Boolean).join(' ');

    await transporter.sendMail({
      from: `"14er Tracker Feedback" <${smtpUser}>`,
      to: 'jay.m.brill@gmail.com',
      replyTo: fromEmail || smtpUser,
      subject: `[14er Feedback] ${subject || 'New message'}`,
      text: [
        `From: ${senderLabel || 'Anonymous'}`,
        '',
        message,
      ].join('\n'),
      html: `
        <p><strong>From:</strong> ${senderLabel || 'Anonymous'}</p>
        <hr/>
        <p style="white-space:pre-wrap">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Feedback email error:', err.message);
    res.status(500).json({ error: 'Failed to send feedback. Please try again.' });
  }
});

module.exports = router;
