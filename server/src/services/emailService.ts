import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

if (config.smtp.host && config.smtp.user && config.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
}

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
  userName: string
): Promise<boolean> => {
  if (!transporter) {
    logger.info('==================================================');
    logger.info(`[DEV PASSWORD RESET LINK]`);
    logger.info(`To: ${email} (${userName})`);
    logger.info(`Reset URL: ${resetUrl}`);
    logger.info(`(Configure SMTP in .env to deliver real emails via an external provider)`);
    logger.info('==================================================');
    return true;
  }

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: email,
      subject: 'EduGo — Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5; margin-bottom: 8px;">EduGo</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">Learn on the Move</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>Hello ${userName},</p>
          <p>You requested a password reset for your EduGo account. Click the button below to choose a new password. This link is valid for 1 hour.</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 13px; color: #64748b;">If you did not request this, please ignore this email. Your account remains completely secure.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">EduGo Learning Platform &copy; ${new Date().getFullYear()}</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    logger.error('[EmailService] Failed to send email via SMTP:', error);
    return false;
  }
};
