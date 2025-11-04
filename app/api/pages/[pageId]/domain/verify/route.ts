import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { stackServerApp } from '@/stack/server';
import dns from 'dns/promises';

// POST: Trigger domain verification
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: {
        id: true,
        userId: true,
        customDomain: true,
        customDomainVerificationToken: true,
        customDomainStatus: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    if (page.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!page.customDomain) {
      return NextResponse.json(
        { error: 'No custom domain set for this page' },
        { status: 400 }
      );
    }

    // Verify DNS records
    const domain = page.customDomain;
    const verificationToken = page.customDomainVerificationToken;
    const expectedCNAME = 'whoami-bio.vercel.app'; // Update with your actual target
    const expectedTXT = `whoami-domain-verification=${verificationToken}`;

    let cnameValid = false;
    let txtValid = false;
    let errors: string[] = [];

    try {
      // Check CNAME record
      const cnameRecords = await dns.resolveCname(domain);
      if (cnameRecords.some(record => record === expectedCNAME || record.endsWith(expectedCNAME))) {
        cnameValid = true;
      } else {
        errors.push(`CNAME record not found or incorrect. Expected: ${expectedCNAME}`);
      }
    } catch (error: any) {
      if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
        errors.push('CNAME record not found');
      } else {
        errors.push(`Error checking CNAME: ${error.message}`);
      }
    }

    try {
      // Check TXT record for verification
      const txtRecords = await dns.resolveTxt(`_whoami-verification.${domain}`);
      const txtValues = txtRecords.flat();
      if (txtValues.some(record => record.includes(expectedTXT))) {
        txtValid = true;
      } else {
        errors.push(`TXT verification record not found. Expected: ${expectedTXT}`);
      }
    } catch (error: any) {
      if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
        errors.push('TXT verification record not found');
      } else {
        errors.push(`Error checking TXT record: ${error.message}`);
      }
    }

    // Determine status
    let newStatus: 'PENDING' | 'VERIFIED' | 'FAILED' = 'PENDING';
    if (cnameValid && txtValid) {
      newStatus = 'VERIFIED';
    } else if (errors.length > 0 && page.customDomainStatus !== 'PENDING') {
      // Only mark as failed if we've tried before and still have errors
      newStatus = 'FAILED';
    }

    // Update page with verification status
    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        customDomainStatus: newStatus,
        customDomainVerifiedAt: newStatus === 'VERIFIED' ? new Date() : null,
      },
    });

    logger.info(`Domain verification for ${domain}: ${newStatus}`);

    return NextResponse.json({
      status: newStatus,
      cnameValid,
      txtValid,
      errors: errors.length > 0 ? errors : undefined,
      dnsRecords: {
        cname: {
          type: 'CNAME',
          name: '@',
          value: expectedCNAME,
          valid: cnameValid,
        },
        txt: {
          type: 'TXT',
          name: '_whoami-verification',
          value: expectedTXT,
          valid: txtValid,
        },
      },
    });
  } catch (error) {
    logger.error('Error verifying domain:', error);
    return NextResponse.json(
      { error: 'Failed to verify domain' },
      { status: 500 }
    );
  }
}
