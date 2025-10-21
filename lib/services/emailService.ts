/**
 * Email Service
 * Unified email sending with template support
 * Used by Campaign Generator, Lead Magnet delivery, and notifications
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email provider configuration
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'smtp'; // smtp, sendgrid, mailgun, etc.

// Create transporter based on provider
function createTransporter(): Transporter {
  if (EMAIL_PROVIDER === 'smtp') {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
    });
  }

  // Add other providers as needed
  throw new Error(`Unsupported email provider: ${EMAIL_PROVIDER}`);
}

const transporter = createTransporter();

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
  }>;
  headers?: Record<string, string>;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a single email
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  try {
    const info = await transporter.sendMail({
      from: options.from || process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
      headers: options.headers,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Send batch emails with rate limiting
 */
export async function sendBatchEmails(
  emails: EmailOptions[],
  options: { delayMs?: number; maxConcurrent?: number } = {}
): Promise<SendResult[]> {
  const { delayMs = 100, maxConcurrent = 5 } = options;
  const results: SendResult[] = [];

  // Process in batches to avoid overwhelming the server
  for (let i = 0; i < emails.length; i += maxConcurrent) {
    const batch = emails.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map((email) => sendEmail(email))
    );
    results.push(...batchResults);

    // Delay between batches
    if (i + maxConcurrent < emails.length && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Template rendering with variable substitution
 */
export function renderTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let rendered = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, String(value));
  }

  return rendered;
}

/**
 * Lead Magnet delivery email
 */
export async function sendLeadMagnetDelivery(
  to: string,
  data: {
    recipientName?: string;
    magnetName: string;
    downloadUrl: string;
    expiresIn?: string;
  }
): Promise<SendResult> {
  const subject = `Your ${data.magnetName} is ready!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Here's your ${data.magnetName}!</h1>

    ${data.recipientName ? `<p>Hi ${data.recipientName},</p>` : '<p>Hi there,</p>'}

    <p>Thank you for your interest! Your ${data.magnetName} is ready to download.</p>

    <a href="${data.downloadUrl}" class="button">Download Now</a>

    ${data.expiresIn ? `<p><small>This link will expire in ${data.expiresIn}.</small></p>` : ''}

    <div class="footer">
      <p>If you have any questions, feel free to reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Here's your ${data.magnetName}!

${data.recipientName ? `Hi ${data.recipientName},` : 'Hi there,'}

Thank you for your interest! Your ${data.magnetName} is ready to download.

Download here: ${data.downloadUrl}

${data.expiresIn ? `This link will expire in ${data.expiresIn}.` : ''}

If you have any questions, feel free to reply to this email.
`;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Campaign notification email
 */
export async function sendCampaignNotification(
  to: string,
  data: {
    campaignName: string;
    status: 'ready' | 'failed';
    assetCount?: number;
    errorMessage?: string;
    dashboardUrl: string;
  }
): Promise<SendResult> {
  const isSuccess = data.status === 'ready';
  const subject = isSuccess
    ? `Your campaign "${data.campaignName}" is ready!`
    : `Campaign generation failed: ${data.campaignName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .status { padding: 12px; border-radius: 5px; margin: 20px 0; }
    .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
    .error { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${isSuccess ? '✓' : '✗'} Campaign ${isSuccess ? 'Ready' : 'Failed'}</h1>

    <div class="status ${isSuccess ? 'success' : 'error'}">
      ${isSuccess
        ? `Your campaign "${data.campaignName}" has been generated with ${data.assetCount} assets.`
        : `We encountered an error generating your campaign: ${data.errorMessage}`
      }
    </div>

    <a href="${data.dashboardUrl}" class="button">
      ${isSuccess ? 'View Campaign' : 'Go to Dashboard'}
    </a>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject,
    html,
  });
}

/**
 * Scheduled post failure notification
 */
export async function sendPostFailureNotification(
  to: string,
  data: {
    platform: string;
    content: string;
    errorMessage: string;
    dashboardUrl: string;
  }
): Promise<SendResult> {
  const subject = `Failed to post to ${data.platform}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .error-box { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 12px; border-radius: 5px; margin: 20px 0; }
    .content-preview { background-color: #f8f9fa; padding: 15px; border-left: 3px solid #6c757d; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Posting Failed</h1>

    <div class="error-box">
      <strong>Error:</strong> ${data.errorMessage}
    </div>

    <p><strong>Platform:</strong> ${data.platform}</p>

    <div class="content-preview">
      <p><strong>Content:</strong></p>
      <p>${data.content.substring(0, 200)}${data.content.length > 200 ? '...' : ''}</p>
    </div>

    <a href="${data.dashboardUrl}" class="button">Review and Retry</a>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject,
    html,
  });
}

/**
 * Drip course email (daily content delivery)
 */
export async function sendDripCourseEmail(
  to: string,
  data: {
    recipientName?: string;
    courseName: string;
    lessonNumber: number;
    lessonName: string;
    downloadUrl: string;
    nextLessonDate?: Date;
  }
): Promise<SendResult> {
  const subject = `${data.courseName} - Lesson ${data.lessonNumber}: ${data.lessonName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .lesson-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .next-lesson { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="lesson-header">
      <h2>Lesson ${data.lessonNumber}</h2>
      <h1>${data.lessonName}</h1>
    </div>

    ${data.recipientName ? `<p>Hi ${data.recipientName},</p>` : '<p>Hi there,</p>'}

    <p>Your next lesson is ready! Continue your learning journey with ${data.courseName}.</p>

    <a href="${data.downloadUrl}" class="button">Access Lesson ${data.lessonNumber}</a>

    ${data.nextLessonDate
      ? `<div class="next-lesson">
          <p><strong>Next lesson:</strong> ${data.nextLessonDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>`
      : ''
    }
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject,
    html,
  });
}

/**
 * Check if email service is configured
 */
export function isConfigured(): boolean {
  if (EMAIL_PROVIDER === 'smtp') {
    return !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    );
  }

  return false;
}

export default {
  sendEmail,
  sendBatchEmails,
  renderTemplate,
  sendLeadMagnetDelivery,
  sendCampaignNotification,
  sendPostFailureNotification,
  sendDripCourseEmail,
  isConfigured,
};
