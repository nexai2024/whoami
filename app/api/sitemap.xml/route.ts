/**
 * GET /api/sitemap.xml - Generate sitemap for all public pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://whoami.bio';

    // Fetch all active public pages
    const pages = await prisma.page.findMany({
      where: {
        isActive: true
      },
      select: {
        slug: true,
        subdomain: true,
        customDomain: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Fetch all published courses
    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED'
      },
      select: {
        slug: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => {
  const url = page.customDomain
    ? `https://${page.customDomain}`
    : page.subdomain
      ? `${baseUrl}/p/${page.subdomain}`
      : `${baseUrl}/p/${page.slug}`;
  
  const lastmod = page.updatedAt.toISOString().split('T')[0];
  
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n')}
${courses.map(course => {
  const url = `${baseUrl}/c/${course.slug}`;
  const lastmod = course.updatedAt.toISOString().split('T')[0];
  
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
}).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


