'use client';

/**
 * Campaign Wizard Component
 * Multi-step wizard for creating marketing campaigns
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Step1Source from './wizard/Step1Source';
import Step2Platforms from './wizard/Step2Platforms';
import Step3Customize from './wizard/Step3Customize';
import Step4Generate from './wizard/Step4Generate';

interface FormData {
  name: string;
  sourceType: 'PRODUCT' | 'BLOCK' | 'CUSTOM';
  sourceId?: string;
  sourceText?: string;
  platforms: string[];
  tone: 'PROFESSIONAL' | 'CASUAL' | 'EXCITED' | 'EDUCATIONAL';
  goal: 'LAUNCH' | 'PROMOTION' | 'ENGAGEMENT';
}

const steps = [
  { id: 1, label: 'Source', description: 'What to promote' },
  { id: 2, label: 'Platforms', description: 'Where to post' },
  { id: 3, label: 'Customize', description: 'Tone & goal' },
  { id: 4, label: 'Generate', description: 'Review & create' },
];

export default function CampaignWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sourceType: 'CUSTOM',
    platforms: [],
    tone: 'PROFESSIONAL',
    goal: 'LAUNCH',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || formData.name.length < 3) return false;
        if (formData.sourceType === 'PRODUCT' || formData.sourceType === 'BLOCK') {
          return !!formData.sourceId;
        }
        if (formData.sourceType === 'CUSTOM') {
          return !!formData.sourceText && formData.sourceText.trim().length > 0;
        }
        return false;
      case 2:
        return formData.platforms.length > 0;
      case 3:
        return !!formData.tone && !!formData.goal;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      setError(null);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleCancel = () => {
    router.push('/marketing/campaigns');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Transform formData to match API expectations
      const payload: any = {
        name: formData.name,
        config: {
          platforms: formData.platforms,
          tone: formData.tone,
          goal: formData.goal,
          socialPostCount: 3,
          emailCount: 3,
          pageVariants: 2,
        },
      };

      // Map sourceType to appropriate field
      if (formData.sourceType === 'PRODUCT' && formData.sourceId) {
        payload.productId = formData.sourceId;
      } else if (formData.sourceType === 'BLOCK' && formData.sourceId) {
        payload.blockId = formData.sourceId;
      } else if (formData.sourceType === 'CUSTOM' && formData.sourceText) {
        payload.customContent = {
          title: formData.name,
          description: formData.sourceText,
        };
      }

      const response = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate campaign');
      }

      toast.success('Campaign generation started!');
      router.push(`/marketing/campaigns/${data.campaignId}`);
    } catch (err: any) {
      console.error('Error generating campaign:', err);
      setError(err.message || 'Failed to generate campaign. Please try again.');
      toast.error(err.message || 'Failed to generate campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Generate Campaign
        </h1>
        <p className="text-gray-600">
          Create AI-powered multi-channel marketing content
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      isCompleted
                        ? 'bg-blue-100 text-blue-600'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? <FiCheck size={20} /> : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <div
                      className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 mt-[-40px] transition-colors ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        {currentStep === 1 && (
          <Step1Source formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 2 && (
          <Step2Platforms formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 3 && (
          <Step3Customize formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 4 && (
          <Step4Generate
            formData={formData}
            onGenerate={handleGenerate}
            loading={loading}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleCancel}
          className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          Cancel
        </button>

        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              Back
            </button>
          )}
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isStepValid(currentStep)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Generating...
                </>
              ) : (
                <>
                  ✨ Generate Campaign
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
