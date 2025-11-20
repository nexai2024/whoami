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
    return nodemailer.createTransport({
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
 * Course enrollment confirmation email (to student)
 */
export async function sendCourseEnrollmentConfirmation(
  to: string,
  data: {
    recipientName?: string;
    courseName: string;
    courseSlug: string;
    accessUrl?: string;
    instructorName?: string;
    isPaid?: boolean;
    price?: number;
  }
): Promise<SendResult> {
  const subject = `Welcome to ${data.courseName}!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
    .button { display: inline-block; padding: 14px 28px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    .info-box { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 You're Enrolled!</h1>
      <h2>${data.courseName}</h2>
    </div>

    ${data.recipientName ? `<p>Hi ${data.recipientName},</p>` : '<p>Hi there,</p>'}

    <p>Congratulations! You've successfully enrolled in <strong>${data.courseName}</strong>.</p>

    ${data.isPaid && data.price ? `
    <div class="info-box">
      <p><strong>Payment Confirmed:</strong> $${data.price}</p>
    </div>
    ` : ''}

    ${data.accessUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.accessUrl}" class="button">Start Learning Now</a>
    </div>
    ` : ''}

    ${data.instructorName ? `<p>${data.instructorName} is excited to have you in the course!</p>` : ''}

    <p>You can access your course anytime by clicking the button above${data.accessUrl ? '' : ' or visiting your dashboard'}.</p>

    <div class="footer">
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Happy learning! 🚀</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
You're Enrolled!

${data.recipientName ? `Hi ${data.recipientName},` : 'Hi there,'}

Congratulations! You've successfully enrolled in ${data.courseName}.

${data.isPaid && data.price ? `Payment Confirmed: $${data.price}\n` : ''}
${data.accessUrl ? `Start learning: ${data.accessUrl}\n` : ''}
${data.instructorName ? `${data.instructorName} is excited to have you in the course!\n` : ''}

You can access your course anytime${data.accessUrl ? ` at ${data.accessUrl}` : ''}.

Happy learning! 🚀
`;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Course enrollment notification email (to instructor/coach)
 */
export async function sendCoachNewEnrollmentNotification(
  to: string,
  data: {
    coachName?: string;
    studentName?: string;
    studentEmail: string;
    courseName: string;
    courseId: string;
    isPaid?: boolean;
    price?: number;
    enrollmentDate: Date;
  }
): Promise<SendResult> {
  const subject = `New Enrollment: ${data.courseName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .info-box { background-color: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New Student Enrolled!</h1>
    </div>

    ${data.coachName ? `<p>Hi ${data.coachName},</p>` : '<p>Hi there,</p>'}

    <p>Great news! You have a new student enrolled in your course:</p>

    <div class="info-box">
      <p><strong>Course:</strong> ${data.courseName}</p>
      <p><strong>Student:</strong> ${data.studentName || 'Anonymous'}</p>
      <p><strong>Email:</strong> ${data.studentEmail}</p>
      ${data.isPaid && data.price ? `<p><strong>Amount:</strong> $${data.price}</p>` : ''}
      <p><strong>Enrolled:</strong> ${data.enrollmentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <p>Keep up the great work! Your students are excited to learn from you.</p>

    <div class="footer">
      <p>View course analytics and manage students in your dashboard.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
New Student Enrolled!

${data.coachName ? `Hi ${data.coachName},` : 'Hi there,'}

Great news! You have a new student enrolled in your course:

Course: ${data.courseName}
Student: ${data.studentName || 'Anonymous'}
Email: ${data.studentEmail}
${data.isPaid && data.price ? `Amount: $${data.price}\n` : ''}
Enrolled: ${data.enrollmentDate.toLocaleDateString()}

Keep up the great work!
`;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Booking confirmation email (to customer)
 */
export async function sendBookingConfirmation(
  to: string,
  data: {
    customerName?: string;
    coachName: string;
    bookingDate: Date;
    bookingTime: string;
    duration: number;
    bookingId: string;
    coachEmail?: string;
    notes?: string;
  }
): Promise<SendResult> {
  const subject = `Booking Confirmed: ${data.bookingDate.toLocaleDateString()} at ${data.bookingTime}`;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
    .info-box { background-color: #f8f9fa; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Booking Confirmed!</h1>
    </div>

    ${data.customerName ? `<p>Hi ${data.customerName},</p>` : '<p>Hi there,</p>'}

    <p>Your booking with <strong>${data.coachName}</strong> has been confirmed!</p>

    <div class="info-box">
      <p><strong>Date:</strong> ${formatDate(data.bookingDate)}</p>
      <p><strong>Time:</strong> ${data.bookingTime}</p>
      <p><strong>Duration:</strong> ${data.duration} minutes</p>
      ${data.coachEmail ? `<p><strong>Coach Email:</strong> <a href="mailto:${data.coachEmail}">${data.coachEmail}</a></p>` : ''}
      ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
    </div>

    <p>Please mark this time in your calendar. We'll send you a reminder 24 hours before your session.</p>

    <div class="footer">
      <p>Booking ID: ${data.bookingId}</p>
      <p>If you need to reschedule or cancel, please contact ${data.coachName}${data.coachEmail ? ` at ${data.coachEmail}` : ''}.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Booking Confirmed!

${data.customerName ? `Hi ${data.customerName},` : 'Hi there,'}

Your booking with ${data.coachName} has been confirmed!

Date: ${formatDate(data.bookingDate)}
Time: ${data.bookingTime}
Duration: ${data.duration} minutes
${data.coachEmail ? `Coach Email: ${data.coachEmail}` : ''}
${data.notes ? `Notes: ${data.notes}` : ''}

Please mark this time in your calendar. We'll send you a reminder 24 hours before your session.

Booking ID: ${data.bookingId}
If you need to reschedule or cancel, please contact ${data.coachName}.
`;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Booking notification email (to coach)
 */
export async function sendBookingNotification(
  to: string,
  data: {
    coachName: string;
    customerName: string;
    customerEmail: string;
    bookingDate: Date;
    bookingTime: string;
    duration: number;
    bookingId: string;
    notes?: string;
  }
): Promise<SendResult> {
  const subject = `New Booking: ${data.customerName} - ${data.bookingDate.toLocaleDateString()} at ${data.bookingTime}`;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
    .info-box { background-color: #f8f9fa; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 New Booking Received</h1>
    </div>

    <p>Hi ${data.coachName},</p>

    <p>You have a new booking!</p>

    <div class="info-box">
      <p><strong>Customer:</strong> ${data.customerName}</p>
      <p><strong>Email:</strong> <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>
      <p><strong>Date:</strong> ${formatDate(data.bookingDate)}</p>
      <p><strong>Time:</strong> ${data.bookingTime}</p>
      <p><strong>Duration:</strong> ${data.duration} minutes</p>
      ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
    </div>

    <a href="${baseUrl}/bookings/${data.bookingId}" class="button">View Booking Details</a>

    <div class="footer">
      <p>Booking ID: ${data.bookingId}</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
New Booking Received!

Hi ${data.coachName},

You have a new booking!

Customer: ${data.customerName}
Email: ${data.customerEmail}
Date: ${formatDate(data.bookingDate)}
Time: ${data.bookingTime}
Duration: ${data.duration} minutes
${data.notes ? `Notes: ${data.notes}` : ''}

Booking ID: ${data.bookingId}
`;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Booking cancellation email
 */
export async function sendBookingCancellation(
  to: string,
  data: {
    customerName?: string;
    coachName: string;
    startTime: Date;
    duration: number;
    reason?: string;
    cancelledBy: 'coach' | 'customer';
  }
): Promise<SendResult> {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const cancelledByText = data.cancelledBy === 'coach' 
    ? `${data.coachName} has cancelled`
    : 'You have cancelled';

  const subject = `Booking Cancelled: ${formatDate(data.startTime)} at ${formatTime(data.startTime)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
    .info-box { background-color: #fef2f2; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Booking Cancelled</h1>
    </div>

    ${data.customerName ? `<p>Hi ${data.customerName},</p>` : '<p>Hi there,</p>'}

    <p>We wanted to let you know that ${cancelledByText} your booking.</p>

    <div class="info-box">
      <p><strong>Date:</strong> ${formatDate(data.startTime)}</p>
      <p><strong>Time:</strong> ${formatTime(data.startTime)}</p>
      <p><strong>Duration:</strong> ${data.duration} minutes</p>
      <p><strong>Coach:</strong> ${data.coachName}</p>
      ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
    </div>

    <p>If you have any questions or would like to reschedule, please contact ${data.coachName}.</p>

    <div class="footer">
      <p>If you have any questions, please reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Booking Cancelled

${data.customerName ? `Hi ${data.customerName},` : 'Hi there,'}

We wanted to let you know that ${cancelledByText} your booking.

Date: ${formatDate(data.startTime)}
Time: ${formatTime(data.startTime)}
Duration: ${data.duration} minutes
Coach: ${data.coachName}
${data.reason ? `Reason: ${data.reason}` : ''}

If you have any questions or would like to reschedule, please contact ${data.coachName}.
  `;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Booking reminder email (24 hours before)
 */
export async function sendBookingReminder(
  to: string,
  data: {
    customerName?: string;
    coachName: string;
    bookingDate: Date;
    bookingTime: string;
    duration: number;
    bookingId: string;
    isCoach?: boolean;
  }
): Promise<SendResult> {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const subject = data.isCoach
    ? `Reminder: Booking Tomorrow - ${formatDate(data.bookingDate)} at ${data.bookingTime}`
    : `Reminder: Your Booking Tomorrow - ${formatDate(data.bookingDate)} at ${data.bookingTime}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
    .info-box { background-color: #eff6ff; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Booking Reminder</h1>
    </div>

    ${data.customerName ? `<p>Hi ${data.customerName},</p>` : '<p>Hi there,</p>'}

    <p>This is a friendly reminder that you have a booking scheduled for tomorrow.</p>

    <div class="info-box">
      <p><strong>Date:</strong> ${formatDate(data.bookingDate)}</p>
      <p><strong>Time:</strong> ${data.bookingTime}</p>
      <p><strong>Duration:</strong> ${data.duration} minutes</p>
      <p><strong>${data.isCoach ? 'Customer' : 'Coach'}:</strong> ${data.isCoach ? data.customerName || 'Customer' : data.coachName}</p>
    </div>

    <p>We look forward to seeing you!</p>

    ${data.isCoach ? '' : `<p>If you need to reschedule or cancel, please contact ${data.coachName} as soon as possible.</p>`}

    <div class="footer">
      <p>Booking ID: ${data.bookingId}</p>
      <p>If you have any questions, please reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Booking Reminder

${data.customerName ? `Hi ${data.customerName},` : 'Hi there,'}

This is a friendly reminder that you have a booking scheduled for tomorrow.

Date: ${formatDate(data.bookingDate)}
Time: ${data.bookingTime}
Duration: ${data.duration} minutes
${data.isCoach ? 'Customer' : 'Coach'}: ${data.isCoach ? data.customerName || 'Customer' : data.coachName}

We look forward to seeing you!

${data.isCoach ? '' : `If you need to reschedule or cancel, please contact ${data.coachName} as soon as possible.`}

Booking ID: ${data.bookingId}
  `;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Purchase confirmation email
 */
export async function sendPurchaseConfirmation(
  to: string,
  data: {
    customerName?: string;
    productName: string;
    amount: number;
    currency: string;
    purchaseId: string;
    downloadUrl?: string;
  }
): Promise<SendResult> {
  const subject = `Purchase Confirmed: ${data.productName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
    .info-box { background-color: #f8f9fa; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Purchase Confirmed!</h1>
    </div>

    ${data.customerName ? `<p>Hi ${data.customerName},</p>` : '<p>Hi there,</p>'}

    <p>Thank you for your purchase!</p>

    <div class="info-box">
      <p><strong>Product:</strong> ${data.productName}</p>
      <p><strong>Amount:</strong> ${data.currency} ${data.amount.toFixed(2)}</p>
      ${data.downloadUrl ? `<p><strong>Download:</strong> <a href="${data.downloadUrl}">Click here to download</a></p>` : ''}
    </div>

    ${data.downloadUrl ? `<a href="${data.downloadUrl}" class="button">Download Now</a>` : ''}

    <div class="footer">
      <p>Purchase ID: ${data.purchaseId}</p>
      <p>If you have any questions about your purchase, please reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
Purchase Confirmed!

${data.customerName ? `Hi ${data.customerName},` : 'Hi there,'}

Thank you for your purchase!

Product: ${data.productName}
Amount: ${data.currency} ${data.amount.toFixed(2)}
${data.downloadUrl ? `Download: ${data.downloadUrl}` : ''}

Purchase ID: ${data.purchaseId}
`;

  return sendEmail({
    to,
    subject,
    html,
    text,
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

// export default {
//   sendEmail,
//   sendBatchEmails,
//   renderTemplate,
//   sendLeadMagnetDelivery,
//   sendCampaignNotification,
//   sendPostFailureNotification,
//   sendDripCourseEmail,
//   isConfigured,
// };
