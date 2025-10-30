import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/funnels/public/[slug]/[stepSlug]
 * Public endpoint to fetch funnel step data for visitors
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; stepSlug: string }> }
) {
  try {
    const { slug, stepSlug } = await params;

    // Find the funnel
    const funnel = await prisma.funnel.findFirst({
      where: {
        slug,
        status: 'ACTIVE',
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    // Find the specific step
    const step = funnel.steps.find((s: { slug: string; }) => s.slug === stepSlug);

    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.funnelStep.update({
      where: { id: step.id },
      data: { views: { increment: 1 } },
    });

    await prisma.funnel.update({
      where: { id: funnel.id },
      data: { totalVisits: { increment: 1 } },
    });

    return NextResponse.json({
      funnel: {
        id: funnel.id,
        name: funnel.name,
        slug: funnel.slug,
        brandColors: funnel.brandColors,
        steps: funnel.steps.map((s: { id: any; slug: any; order: any; type: any; }) => ({
          id: s.id,
          slug: s.slug,
          order: s.order,
          type: s.type,
        })),
      },
      step: {
        id: step.id,
        name: step.name,
        slug: step.slug,
        type: step.type,
        order: step.order,
        headline: step.headline,
        subheadline: step.subheadline,
        content: step.content,
        ctaText: step.ctaText,
        ctaUrl: step.ctaUrl,
        backgroundImage: step.backgroundImage,
        videoUrl: step.videoUrl,
        formConfig: step.formConfig,
      },
    });
  } catch (error) {
    console.error('Error fetching funnel step:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnel step' },
      { status: 500 }
    );
  }
}
