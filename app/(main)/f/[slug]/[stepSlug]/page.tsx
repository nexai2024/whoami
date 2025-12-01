'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import SafeIcon from '@/common/SafeIcon';

interface FunnelStep {
  id: string;
  name: string;
  slug: string;
  type: string;
  order: number;
  headline?: string;
  subheadline?: string;
  content?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImage?: string;
  videoUrl?: string;
  formConfig?: any;
}

interface Funnel {
  id: string;
  name: string;
  slug: string;
  brandColors?: any;
  steps: FunnelStep[];
}

export default function FunnelStepPage() {
  const params = useParams();
  const router = useRouter();
  const { slug, stepSlug } = params;

  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [currentStep, setCurrentStep] = useState<FunnelStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitorId, setVisitorId] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Generate or retrieve visitor ID
    let vid = localStorage.getItem('funnel_visitor_id');
    if (!vid) {
      vid = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('funnel_visitor_id', vid);
    }
    setVisitorId(vid);

    loadFunnelStep();
  }, [slug, stepSlug]);

  // Track page view after both funnel and visitorId are loaded
  useEffect(() => {
    if (funnel && currentStep && visitorId) {
      trackStepView(funnel.id, currentStep.id);
    }
  }, [funnel, currentStep, visitorId]);

  const loadFunnelStep = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/funnels/public/${slug}/${stepSlug}`);

      if (response.ok) {
        const data = await response.json();
        // Ensure steps are sorted by order
        const sortedSteps = [...(data.funnel.steps || [])].sort((a: FunnelStep, b: FunnelStep) => a.order - b.order);
        setFunnel({
          ...data.funnel,
          steps: sortedSteps,
        });
        setCurrentStep(data.step);
      } else {
        console.error('Failed to load funnel step');
      }
    } catch (error) {
      console.error('Error loading funnel step:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackStepView = async (funnelId: string, stepId: string) => {
    if (!visitorId) return; // Wait for visitorId to be set
    
    try {
      await fetch('/api/funnels/track/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funnelId,
          stepId,
          visitorId,
          url: window.location.href,
          referrer: document.referrer,
        }),
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleCTAClick = () => {
    if (!currentStep?.ctaUrl) return;

    // Track CTA click
    if (funnel && currentStep) {
      fetch('/api/funnels/track/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funnelId: funnel.id,
          stepId: currentStep.id,
          visitorId,
          action: 'cta_click',
        }),
      });
    }

    // Navigate to next step or external URL
    if (currentStep.ctaUrl.startsWith('http')) {
      window.location.href = currentStep.ctaUrl;
    } else {
      router.push(`/f/${slug}/${currentStep.ctaUrl.replace('/', '')}`);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!funnel || !currentStep) return;

    setSubmitting(true);

    try {
      // Submit form data
      const response = await fetch('/api/funnels/track/form-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funnelId: funnel.id,
          stepId: currentStep.id,
          visitorId,
          formData,
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        // Ensure steps are sorted by order
        const sortedSteps = [...funnel.steps].sort((a, b) => a.order - b.order);
        
        // Find the next step
        const nextStep = sortedSteps.find(s => s.order === currentStep.order + 1);
        
        if (nextStep) {
          // Navigate to next step
          router.push(`/f/${slug}/${nextStep.slug}`);
        } else if (currentStep.ctaUrl) {
          // If no next step, use CTA URL
          if (currentStep.ctaUrl.startsWith('http')) {
            window.location.href = currentStep.ctaUrl;
          } else {
            router.push(currentStep.ctaUrl);
          }
        } else {
          // No next step and no CTA - show completion message or redirect
          console.warn('No next step found and no CTA URL configured');
          // Could show a success message or redirect to a thank you page
        }
      } else {
        console.error('Form submission failed:', responseData.error || 'Unknown error');
        alert('Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!funnel || !currentStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600">This funnel step doesn't exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  const primaryColor = funnel.brandColors?.primary || '#4F46E5';
  const secondaryColor = funnel.brandColors?.secondary || '#818CF8';

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: currentStep.backgroundImage
          ? `url(${currentStep.backgroundImage})`
          : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Progress Indicator */}
      <div className="bg-white/90 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {funnel.steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    step.order <= currentStep.order ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
                {index < funnel.steps.length - 1 && (
                  <SafeIcon
                    name={undefined}
                    icon={step.order < currentStep.order ? FiCheck : FiArrowRight}
                    className={step.order < currentStep.order ? 'text-green-600' : 'text-gray-400'}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center mt-2 text-sm text-gray-600">
            Step {currentStep.order + 1} of {funnel.steps.length}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Headline */}
          {currentStep.headline && (
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
              {currentStep.headline}
            </h1>
          )}

          {/* Subheadline */}
          {currentStep.subheadline && (
            <p className="text-xl text-gray-600 mb-8 text-center">{currentStep.subheadline}</p>
          )}

          {/* Video */}
          {currentStep.type === 'VIDEO_SALES' && currentStep.videoUrl && (
            <div className="mb-8 aspect-video">
              <iframe
                src={currentStep.videoUrl}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          )}

          {/* Content */}
          {currentStep.content && (
            <div
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: currentStep.content.replace(/\n/g, '<br />') }}
            />
          )}

          {/* Lead Capture Form */}
          {currentStep.type === 'LEAD_CAPTURE' && (
            <form onSubmit={handleFormSubmit} className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {submitting ? 'Submitting...' : currentStep.ctaText || 'Continue'}
              </button>
            </form>
          )}

          {/* CTA Button (for non-form steps) */}
          {currentStep.type !== 'LEAD_CAPTURE' && currentStep.ctaText && (
            <div className="text-center">
              <button
                onClick={handleCTAClick}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white text-lg transition-transform hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                {currentStep.ctaText}
                <SafeIcon name={undefined} icon={FiArrowRight} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
