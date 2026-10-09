import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string | null;
  mode: 'smtp' | 'ethereal' | 'logged';
  error?: string;
}

export interface DispatchedEmailRecord {
  to: string;
  subject: string;
  resetUrl: string;
  previewUrl?: string | null;
  mode: 'smtp' | 'ethereal' | 'logged';
  timestamp: Date;
}

let cachedTransporter: nodemailer.Transporter | null = null;
let lastDispatchedEmail: DispatchedEmailRecord | null = null;

/**
 * Initializes or retrieves the active mail transporter.
 * Prioritizes configured SMTP credentials. In development/testing when SMTP credentials
 * are not provided, dynamically provisions an Ethereal test SMTP account.
 */
export const getTransporter = async (): Promise<{
  transporter: nodemailer.Transporter | null;
  mode: 'smtp' | 'ethereal' | 'logged';
}> => {
  // 1. Configured SMTP Provider (e.g. Gmail, Mailtrap, Brevo, AWS SES, SendGrid)
  if (config.smtp.host && config.smtp.user && config.smtp.pass) {
    if (!cachedTransporter) {
      const isGmail = config.smtp.host.toLowerCase().includes('gmail');
      const transportOptions: nodemailer.TransportOptions = {
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
        tls: {
          rejectUnauthorized: config.nodeEnv === 'production',
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        ...(isGmail ? { service: 'gmail' } : {}),
      } as any;

      cachedTransporter = nodemailer.createTransport(transportOptions);
      logger.info(`[EmailService] Configured SMTP transporter for host: ${config.smtp.host}:${config.smtp.port}`);
    }
    return { transporter: cachedTransporter, mode: 'smtp' };
  }

  // 2. Development & Test Mode
  if (config.nodeEnv !== 'production') {
    if (!cachedTransporter) {
      if (process.env.NODE_ENV === 'test') {
        // Fast, reliable JSON transport for automated unit/integration test suites
        cachedTransporter = nodemailer.createTransport({ jsonTransport: true });
        logger.info('[EmailService] Test JSON transporter initialized');
        return { transporter: cachedTransporter, mode: 'logged' };
      }

      try {
        const testAccountPromise = nodemailer.createTestAccount();
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Ethereal setup timeout')), 3000)
        );
        const testAccount: any = await Promise.race([testAccountPromise, timeoutPromise]);
        cachedTransporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        logger.info(`[EmailService] Ethereal test SMTP transporter initialized (${testAccount.user})`);
      } catch (err: any) {
        logger.warn('[EmailService] Could not reach Ethereal service; falling back to simulated mail delivery:', err.message);
        cachedTransporter = nodemailer.createTransport({ jsonTransport: true });
        return { transporter: cachedTransporter, mode: 'logged' };
      }
    }
    return { transporter: cachedTransporter, mode: 'ethereal' };
  }

  return { transporter: null, mode: 'logged' };
};

/**
 * Dispatches a password reset email.
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
  userName: string
): Promise<EmailDispatchResult> => {
  try {
    const { transporter, mode } = await getTransporter();

    const mailOptions = {
      from: config.smtp.from || 'EduGo <no-reply@edugo.org>',
      to: email,
      subject: 'EduGo — Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="margin-bottom: 20px;">
            <h2 style="color: #4f46e5; margin: 0 0 4px 0; font-size: 24px; font-weight: 800;">EduGo</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0;">Learn on the Move</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            We received a request to reset the password for your EduGo account. Click the button below to establish a new password. This link is valid for <strong>1 hour</strong> and can only be used once.
          </p>
          <div style="margin: 32px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
            If you did not request this password reset, you can safely ignore this email. Your existing credentials remain completely secure.
          </p>
          <p style="font-size: 12px; color: #94a3b8; word-break: break-all; margin-top: 24px;">
            Or copy and paste this link into your browser:<br />
            <a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">EduGo Learning Platform &copy; ${new Date().getFullYear()}</p>
        </div>
      `,
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      const testPreview = mode === 'ethereal' ? nodemailer.getTestMessageUrl(info) || null : null;

      lastDispatchedEmail = {
        to: email,
        subject: mailOptions.subject,
        resetUrl,
        previewUrl: testPreview,
        mode,
        timestamp: new Date(),
      };

      if (mode === 'ethereal') {
        logger.info(`[EmailService] Password reset email sent to Ethereal Mail! Web Preview: ${testPreview}`);
      } else {
        logger.info(`[EmailService] Password reset email sent via SMTP to ${email} (MessageId: ${info.messageId})`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: testPreview,
        mode,
      };
    } else {
      // Fallback logger for environments without outbound internet access or SMTP
      lastDispatchedEmail = {
        to: email,
        subject: mailOptions.subject,
        resetUrl,
        mode: 'logged',
        timestamp: new Date(),
      };

      logger.info('==================================================');
      logger.info(`[EmailService] Password reset dispatch for: ${email}`);
      logger.info(`Reset URL: ${resetUrl}`);
      logger.info('Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env to deliver real emails.');
      logger.info('==================================================');

      return {
        success: true,
        mode: 'logged',
      };
    }
  } catch (error: any) {
    logger.error('[EmailService] Failed to dispatch password reset email:', error.message || error);
    return {
      success: false,
      mode: 'smtp',
      error: error.message || 'SMTP delivery failed',
    };
  }
};

/**
 * Accessor for recent email dispatch (used by automated test suites and dev verification)
 */
export const getLastDispatchedEmail = (): DispatchedEmailRecord | null => {
  return lastDispatchedEmail;
};

/**
 * Clear recent email dispatch record
 */
export const clearLastDispatchedEmail = (): void => {
  lastDispatchedEmail = null;
};
