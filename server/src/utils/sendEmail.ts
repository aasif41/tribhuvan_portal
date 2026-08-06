import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      console.warn('⚠️ SMTP not configured. Email not sent:', options.subject);
      return;
    }

    await transporter.sendMail({
      from: `"Tribhuvan College" <${env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`📧 Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
}

export async function sendApprovalNotification(userName: string, userEmail: string): Promise<void> {
  await sendEmail({
    to: env.ADMIN_EMAIL,
    subject: `New Registration Request - ${userName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0d1f3c; padding: 20px; text-align: center;">
          <h1 style="color: #c8922a; margin: 0;">Tribhuvan College</h1>
        </div>
        <div style="padding: 20px; background-color: #f4f6fb;">
          <h2 style="color: #1a2744;">New Registration Request</h2>
          <p style="color: #64748b;">A new user has registered and is awaiting approval:</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
          </div>
          <p style="color: #64748b;">Please log in to the admin dashboard to approve or reject this request.</p>
        </div>
      </div>
    `,
  });
}

export async function sendApprovalEmail(userName: string, userEmail: string): Promise<void> {
  await sendEmail({
    to: userEmail,
    subject: 'Account Approved - Tribhuvan College Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0d1f3c; padding: 20px; text-align: center;">
          <h1 style="color: #c8922a; margin: 0;">Tribhuvan College</h1>
        </div>
        <div style="padding: 20px; background-color: #f4f6fb;">
          <h2 style="color: #1a2744;">Account Approved! 🎉</h2>
          <p style="color: #64748b;">Dear ${userName},</p>
          <p style="color: #64748b;">Your account has been approved. You can now log in to the Tribhuvan College Portal and access your dashboard.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://tribhuvancollege.ac.in/portal" style="background-color: #c8922a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to Portal</a>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendRejectionEmail(userName: string, userEmail: string): Promise<void> {
  await sendEmail({
    to: userEmail,
    subject: 'Account Registration Update - Tribhuvan College Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0d1f3c; padding: 20px; text-align: center;">
          <h1 style="color: #c8922a; margin: 0;">Tribhuvan College</h1>
        </div>
        <div style="padding: 20px; background-color: #f4f6fb;">
          <h2 style="color: #1a2744;">Registration Update</h2>
          <p style="color: #64748b;">Dear ${userName},</p>
          <p style="color: #64748b;">Unfortunately, your registration request has not been approved at this time. If you believe this is an error, please contact the administration.</p>
          <p style="color: #64748b;">Contact: info@tribhuvancollege.ac.in</p>
        </div>
      </div>
    `,
  });
}
