/**
 * GET /api/courses/[courseId]/certificate/[certificateId]/download
 * Download certificate PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/utils/logger';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; certificateId: string }> }
) {
  try {
    const { courseId, certificateId } = await params;

    // Extract enrollment ID from certificate ID
    const enrollmentId = certificateId.split('_')[1];

    // Get enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    if (!enrollment || !enrollment.certificateIssued) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Generate certificate HTML (in production, convert to PDF)
    const studentName = enrollment.name || enrollment.email.split('@')[0];
    const courseName = enrollment.course.title;
    const completionDate = enrollment.completedAt || enrollment.certificateIssuedAt || new Date();
    const instructorName = enrollment.course.user?.profile?.displayName || 
                          enrollment.course.user?.profile?.username || 
                          undefined;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: letter landscape; margin: 0; }
    body {
      margin: 0;
      padding: 40px;
      font-family: 'Times New Roman', serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .certificate {
      background: white;
      padding: 60px;
      border: 20px solid #d4af37;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      max-width: 900px;
    }
    .title {
      font-size: 48px;
      font-weight: bold;
      color: #333;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 4px;
    }
    .subtitle {
      font-size: 24px;
      color: #666;
      margin-bottom: 40px;
    }
    .name {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
      margin: 40px 0;
      border-bottom: 3px solid #d4af37;
      padding-bottom: 20px;
      display: inline-block;
    }
    .course {
      font-size: 28px;
      color: #333;
      margin: 30px 0;
    }
    .date {
      font-size: 18px;
      color: #666;
      margin-top: 40px;
    }
    .signature {
      margin-top: 60px;
      display: flex;
      justify-content: space-around;
    }
    .signature-line {
      border-top: 2px solid #333;
      width: 200px;
      margin-top: 60px;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="title">Certificate of Completion</div>
    <div class="subtitle">This is to certify that</div>
    <div class="name">${studentName}</div>
    <div class="subtitle">has successfully completed the course</div>
    <div class="course">${courseName}</div>
    <div class="date">Completed on ${completionDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</div>
    ${instructorName ? `
    <div class="signature">
      <div>
        <div class="signature-line"></div>
        <div style="margin-top: 10px;">${instructorName}</div>
        <div style="font-size: 14px; color: #666;">Instructor</div>
      </div>
    </div>
    ` : ''}
  </div>
</body>
</html>
    `;

    // Return HTML certificate (in production, convert to PDF using puppeteer)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="certificate-${courseId}.html"`,
      },
    });
  } catch (error) {
    logger.error('Error downloading certificate:', error);
    return NextResponse.json(
      { error: 'Failed to download certificate' },
      { status: 500 }
    );
  }
}

