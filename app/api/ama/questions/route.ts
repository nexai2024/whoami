import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { sendEmail } from '@/lib/services/emailService';

/**
 * POST /api/ama/questions
 * Submit an AMA question
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      pageId, 
      blockId, 
      email, 
      name,
      question,
      requireApproval = true
    } = body;

    // Validation
    if (!pageId || !blockId || !email || !question) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: pageId, blockId, email, question' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate question length
    if (question.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Question must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Get page and block info
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { 
        user: { 
          include: { profile: true } 
        },
        blocks: {
          where: { id: blockId }
        }
      }
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    const block = page.blocks[0];
    if (!block) {
      return NextResponse.json(
        { success: false, error: 'Block not found' },
        { status: 404 }
      );
    }

    // Check if we need to store questions in a database
    // For now, we'll just send an email notification
    // In the future, you might want to create an AMAQuestion model

    const ownerEmail = page.user?.email;
    const ownerName = page.user?.profile?.displayName || page.user?.profile?.username || 'Page Owner';
    const moderationEmail = block.data?.moderationEmail || ownerEmail;

    // Send notification email to page owner/moderation email
    if (moderationEmail) {
      try {
        const statusText = requireApproval ? 'pending approval' : 'submitted';
        
        await sendEmail({
          to: moderationEmail,
          subject: `New AMA Question - ${page.title}`,
          html: `
            <h2>New AMA Question ${requireApproval ? '(Pending Approval)' : ''}</h2>
            <p>You received a new question on your page: <strong>${page.title}</strong></p>
            <hr />
            <div style="margin: 20px 0;">
              <p><strong>From:</strong> ${name ? `${name} (${email})` : email}</p>
              <p><strong>Question:</strong></p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                ${question.replace(/\n/g, '<br />')}
              </div>
              <p><strong>Status:</strong> ${statusText}</p>
            </div>
            <hr />
            <p style="color: #666; font-size: 12px;">
              Submitted at: ${new Date().toLocaleString()}<br />
              Page: ${page.title}<br />
              Block ID: ${blockId}
            </p>
            ${requireApproval ? '<p style="color: #666; font-size: 12px; margin-top: 10px;">This question requires approval before being displayed.</p>' : ''}
          `,
          text: `New AMA Question\n\nFrom: ${name ? `${name} (${email})` : email}\n\nQuestion:\n${question}\n\nStatus: ${statusText}\n\nSubmitted at: ${new Date().toLocaleString()}\nPage: ${page.title}`
        });

        logger.info('AMA question notification sent', { moderationEmail, pageId, blockId });
      } catch (emailError) {
        logger.error('Error sending AMA question notification', emailError);
        // Don't fail the request if email fails
      }
    }

    // Send confirmation email to question submitter
    try {
      await sendEmail({
        to: email,
        subject: `Question Submitted - ${page.title}`,
        html: `
          <h2>Thank You for Your Question!</h2>
          <p>Hi ${name || 'there'},</p>
          <p>We've received your question:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
            ${question.replace(/\n/g, '<br />')}
          </div>
          ${requireApproval 
            ? '<p>Your question is pending approval and will be displayed once approved.</p>'
            : '<p>We\'ll review your question and get back to you soon!</p>'
          }
          <p>Best regards,<br />${ownerName}</p>
        `,
        text: `Thank You for Your Question!\n\nHi ${name || 'there'},\n\nWe've received your question:\n\n${question}\n\n${requireApproval ? 'Your question is pending approval and will be displayed once approved.' : 'We\'ll review your question and get back to you soon!'}\n\nBest regards,\n${ownerName}`
      });

      logger.info('AMA question confirmation sent', { email, pageId });
    } catch (emailError) {
      logger.error('Error sending AMA question confirmation', emailError);
      // Don't fail the request if confirmation email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Question submitted successfully',
      requireApproval
    });

  } catch (error) {
    logger.error('Error processing AMA question:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process question submission' },
      { status: 500 }
    );
  }
}

