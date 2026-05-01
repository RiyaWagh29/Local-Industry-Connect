import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure server/.env is loaded even if CWD is the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Lazy-create the transporter on first use so that env vars are guaranteed
// to be loaded (ES module import hoisting runs imports before server.js body).
let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    console.log('[EmailService] Creating SMTP transporter:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? '***set***' : '***MISSING***',
      pass: process.env.SMTP_PASS ? '***set***' : '***MISSING***',
      from: process.env.SMTP_FROM ? '***set***' : '***MISSING***',
    });
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

export const sendOtpEmail = async (email, otp) => {
  const requiredConfig = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  const missingConfig = requiredConfig.filter((key) => !process.env[key]);

  if (missingConfig.length > 0) {
    console.error(`[EmailService] Missing SMTP configuration: ${missingConfig.join(', ')}`);
    return false;
  }

  const mailOptions = {
    from: `"Local Industry Connect" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Your Login OTP',
    text: `Your OTP for login is: ${otp}. It will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Local Industry Connect</h2>
        <p>Hello,</p>
        <p>Your OTP for logging into your account is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in <strong>5 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          &copy; 2026 Local Industry Connect. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    console.log(`[EmailService] Attempting to send OTP email to: ${email}`);
    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`[EmailService] OTP email sent successfully to: ${email}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Error sending OTP email:', error.message || error);
    // Reset transporter so it can be recreated on next attempt
    // (handles cases where credentials were rotated)
    _transporter = null;
    return false;
  }
};
