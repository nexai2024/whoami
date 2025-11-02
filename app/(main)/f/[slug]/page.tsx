import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

/**
 * Funnel Entry Point
 * Redirects to the first step of the funnel
 */
export default async function FunnelEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Find the funnel and its first step
  const funnel = await prisma.funnel.findFirst({
    where: {
      slug,
      status: 'ACTIVE',
    },
    include: {
      steps: {
        orderBy: { order: 'asc' },
        take: 1,
      },
    },
  });

  if (!funnel || funnel.steps.length === 0) {
    redirect('/404');
  }

  // Redirect to first step
  const firstStep = funnel.steps[0];
  redirect(`/f/${slug}/${firstStep.slug}`);
}
