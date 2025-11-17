import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { sendEmail } from '@/lib/services/emailService';

/**
 * POST /api/contact-form
 * Handle contact form submissions from blocks
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      pageId, 
      blockId, 
      formData, 
      notificationEmail,
      sendAutoReply,
      autoReplyMessage 
    } = body;

    // Validation
    if (!pageId || !blockId || !formData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: pageId, blockId, formData' },
        { status: 400 }
      );
    }

    // Get page and block info
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { user: { include: { profile: true } } }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // Validate email if present
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Store submission in database (if you have a ContactSubmission model)
    // For now, we'll just send emails

    const ownerEmail = page.user?.email || notificationEmail;
    const ownerName = page.user?.profile?.displayName || page.user?.profile?.username || 'Page Owner';

    // Send notification email to page owner
    if (ownerEmail) {
      try {
        const formFields = Object.entries(formData)
          .map(([key, value]) => `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}`)
          .join('\n\n');

        await sendEmail({
          to: ownerEmail,
          subject: `New Contact Form Submission - ${page.title}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p>You received a new message from your page: <strong>${page.title}</strong></p>
            <hr />
            <div style="margin: 20px 0;">
              ${formFields}
            </div>
            <hr />
            <p style="color: #666; font-size: 12px;">
              Submitted at: ${new Date().toLocaleString()}<br />
              Page: ${page.title}<br />
              Block ID: ${blockId}
            </p>
          `,
          text: `New Contact Form Submission\n\n${Object.entries(formData).map(([k, v]) => `${k}: ${v}`).join('\n')}`
        });

        logger.info('Contact form notification sent', { ownerEmail, pageId, blockId });
      } catch (emailError) {
        logger.error('Error sending contact form notification', emailError);
        // Don't fail the request if email fails
      }
    }

    // Send auto-reply if enabled
    if (sendAutoReply && formData.email && autoReplyMessage) {
      try {
        await sendEmail({
          to: formData.email,
          subject: `Re: ${page.title}`,
          html: autoReplyMessage.replace(/\n/g, '<br />'),
          text: autoReplyMessage
        });

        logger.info('Contact form auto-reply sent', { email: formData.email, pageId });
      } catch (emailError) {
        logger.error('Error sending contact form auto-reply', emailError);
        // Don't fail the request if auto-reply fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully'
    });

  } catch (error) {
    logger.error('Error processing contact form submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process form submission' },
      { status: 500 }
    );
  }
}

