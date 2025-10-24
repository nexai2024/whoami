'use client';

/**
 * Onboarding Tour Component
 * Guides new users through key features
 */

import { useState, useEffect } from 'react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Whoami! 👋',
    description: 'Let\'s take a quick tour of your marketing hub and get you started.',
    position: 'bottom'
  },
  {
    id: 'products',
    title: 'Manage Products',
    description: 'Create and manage your digital products here. Products can be used in campaigns and lead magnets.',
    target: '[href="/marketing/products"]',
    position: 'right'
  },
  {
    id: 'campaigns',
    title: 'Campaign Generator',
    description: 'AI-powered campaign generation. Create multi-channel marketing campaigns in minutes.',
    target: '[href="/marketing/campaigns"]',
    position: 'right'
  },
  {
    id: 'scheduler',
    title: 'Smart Scheduler',
    description: 'Schedule posts across platforms with AI-suggested optimal posting times.',
    target: '[href="/marketing/schedule"]',
    position: 'right'
  },
  {
    id: 'lead-magnets',
    title: 'Lead Magnets',
    description: 'Create content upgrades to build your email list. PDFs, ebooks, templates, and more.',
    target: '[href="/marketing/lead-magnets"]',
    position: 'right'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    description: 'Start by creating your first product or campaign. Need help? Check the help center anytime.',
    position: 'bottom'
  }
];

interface OnboardingTourProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has completed tour
    const checkTourStatus = async () => {
      try {
        const response = await fetch('/api/onboarding', {
          headers: { 'x-user-id': 'demo-user' }
        });
        const data = await response.json();

        if (!data.tourCompleted && !data.skipped) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking tour status:', error);
      }
    };

    checkTourStatus();
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    try {
      await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({ skipped: true })
      });
      setIsVisible(false);
      onSkip?.();
    } catch (error) {
      console.error('Error skipping tour:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({ tourCompleted: true })
      });
      setIsVisible(false);
      onComplete?.();
    } catch (error) {
      console.error('Error completing tour:', error);
    }
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />

      {/* Tour Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-4">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
            <p className="text-gray-600">{step.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Skip Tour
            </button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>

          {/* Step Counter */}
          <div className="mt-4 text-center text-sm text-gray-500">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </div>
        </div>
      </div>
    </>
  );
}
