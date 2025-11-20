/**
 * GET /api/courses/[courseId]/certificate - Generate and download course certificate
 * POST /api/courses/[courseId]/certificate - Issue certificate for completed course
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/utils/logger';

const prisma = new PrismaClient();

/**
 * Generate a simple certificate PDF
 * Note: This is a basic implementation. For production, use a proper PDF library like pdfkit or puppeteer
 */
async function generateCertificatePDF(
  studentName: string,
  courseName: string,
  completionDate: Date,
  instructorName?: string
): Promise<Buffer> {
  // For now, return a simple HTML-based certificate
  // In production, you'd use pdfkit, puppeteer, or @react-pdf/renderer
  
  const html = `
<!DOCTYPE html>
<html>
<head>
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

  // For now, return HTML. In production, convert to PDF using puppeteer or similar
  // This is a placeholder - you'll need to implement actual PDF generation
  return Buffer.from(html);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const userId = request.headers.get('x-user-id');
    const searchParams = request.nextUrl.searchParams;
    const enrollmentId = searchParams.get('enrollmentId');

    if (!userId && !enrollmentId) {
      return NextResponse.json(
        { error: 'Authentication or enrollment ID required' },
        { status: 401 }
      );
    }

    // Get enrollment
    const enrollment = enrollmentId
      ? await prisma.courseEnrollment.findUnique({
          where: { id: enrollmentId }
        })
      : await prisma.courseEnrollment.findFirst({
          where: {
            courseId,
            userId: userId || undefined
          }
        });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check if course is completed
    if (!enrollment.completedAt || enrollment.progressPercentage < 100) {
      return NextResponse.json(
        { error: 'Course must be completed to receive a certificate' },
        { status: 400 }
      );
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if certificate already exists
    if (enrollment.certificateUrl) {
      // Return existing certificate URL
      return NextResponse.json({
        certificateUrl: enrollment.certificateUrl,
        issuedAt: enrollment.certificateIssuedAt
      });
    }

    // Generate certificate
    const studentName = enrollment.name || enrollment.email.split('@')[0];
    const instructorName = course.user?.profile?.displayName || 
                          course.user?.profile?.username || 
                          undefined;

    // For now, we'll create a certificate URL that can be used to generate the PDF
    // In production, you'd generate the PDF and store it in R2/S3
    const certificateId = `cert_${enrollment.id}_${Date.now()}`;
    
    // Update enrollment with certificate info
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const certificateUrl = `${baseUrl}/api/courses/${courseId}/certificate/${certificateId}/download`;

    await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        certificateIssued: true,
        certificateUrl,
        certificateIssuedAt: new Date()
      }
    });

    return NextResponse.json({
      certificateUrl,
      issuedAt: new Date().toISOString(),
      message: 'Certificate generated successfully'
    });
  } catch (error) {
    logger.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get enrollment
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        userId
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check if course is completed
    if (!enrollment.completedAt || enrollment.progressPercentage < 100) {
      return NextResponse.json(
        { error: 'Course must be completed to receive a certificate' },
        { status: 400 }
      );
    }

    // Issue certificate (same as GET, but triggered manually)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const certificateId = `cert_${enrollment.id}_${Date.now()}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const certificateUrl = `${baseUrl}/api/courses/${courseId}/certificate/${certificateId}/download`;

    await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        certificateIssued: true,
        certificateUrl,
        certificateIssuedAt: new Date()
      }
    });

    return NextResponse.json({
      certificateUrl,
      issuedAt: new Date().toISOString(),
      message: 'Certificate issued successfully'
    });
  } catch (error) {
    logger.error('Error issuing certificate:', error);
    return NextResponse.json(
      { error: 'Failed to issue certificate' },
      { status: 500 }
    );
  }
}

