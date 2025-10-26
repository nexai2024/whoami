/**
 * Public Lead Magnet Opt-In Page
 * Displays lead magnet landing page and opt-in form
 */

import { notFound } from 'next/navigation';
import { PrismaClient, MagnetStatus } from '@prisma/client';
import OptInForm from '@/components/lead-magnets/OptInForm';
import { Metadata } from 'next';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    slugOrId: string;
  };
}

async function getLeadMagnet(slugOrId: string) {
  // Try to find by slug first
  let leadMagnet = await prisma.leadMagnet.findUnique({
    where: { slug: slugOrId },
  });

  // Fallback to ID if slug lookup fails
  if (!leadMagnet) {
    leadMagnet = await prisma.leadMagnet.findUnique({
      where: { id: slugOrId },
    });
  }

  // Return 404 if not found or not active
  if (!leadMagnet || leadMagnet.status !== MagnetStatus.ACTIVE) {
    return null;
  }

  return leadMagnet;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const leadMagnet = await getLeadMagnet(params.slugOrId);

  if (!leadMagnet) {
    return {
      title: 'Lead Magnet Not Found',
    };
  }

  return {
    title: leadMagnet.headline,
    description: leadMagnet.subheadline || leadMagnet.description || undefined,
    openGraph: {
      title: leadMagnet.headline,
      description: leadMagnet.subheadline || leadMagnet.description || undefined,
      images: leadMagnet.coverImageUrl ? [leadMagnet.coverImageUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LeadMagnetOptInPage({ params }: PageProps) {
  const leadMagnet = await getLeadMagnet(params.slugOrId);

  if (!leadMagnet) {
    notFound();
  }

  // Parse brand colors if provided
  const brandColors = leadMagnet.brandColors as any;
  const primaryColor = brandColors?.primary || '#4F46E5';
  const secondaryColor = brandColors?.secondary || '#818CF8';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      {leadMagnet.coverImageUrl && (
        <div className="w-full h-64 md:h-96 relative overflow-hidden">
          <img
            src={leadMagnet.coverImageUrl}
            alt={leadMagnet.headline}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50" />
        </div>
      )}

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div
            className="p-8 md:p-12 text-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {leadMagnet.headline}
            </h1>
            {leadMagnet.subheadline && (
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {leadMagnet.subheadline}
              </p>
            )}
          </div>

          {/* Benefits Section */}
          {leadMagnet.benefits && leadMagnet.benefits.length > 0 && (
            <div className="p-8 md:p-12 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                What You'll Get:
              </h2>
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {leadMagnet.benefits.map((benefit: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opt-In Form Section */}
          <div className="p-8 md:p-12 bg-gray-50">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Get Instant Access
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Enter your email to receive your free {leadMagnet.name}
              </p>
              <OptInForm leadMagnetId={leadMagnet.id} primaryColor={primaryColor} />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-100 text-center">
            <p className="text-sm text-gray-600">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Additional Description */}
        {leadMagnet.description && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 max-w-2xl mx-auto">
              {leadMagnet.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
