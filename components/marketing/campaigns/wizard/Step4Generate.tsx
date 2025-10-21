'use client';

/**
 * Campaign Wizard - Step 4: Review & Generate
 * Final review and campaign generation
 */

import { FiCheck } from 'react-icons/fi';

interface FormData {
  name: string;
  sourceType: 'PRODUCT' | 'BLOCK' | 'CUSTOM';
  sourceId?: string;
  sourceText?: string;
  platforms: string[];
  tone: 'PROFESSIONAL' | 'CASUAL' | 'EXCITED' | 'EDUCATIONAL';
  goal: 'LAUNCH' | 'PROMOTION' | 'ENGAGEMENT';
}

interface Step4GenerateProps {
  formData: FormData;
  onGenerate: () => void;
  loading: boolean;
}

const platformIcons: Record<string, string> = {
  TWITTER: '𝕏',
  INSTAGRAM: '📷',
  LINKEDIN: '💼',
  FACEBOOK: '👥',
  TIKTOK: '🎵',
  EMAIL: '📧',
};

export default function Step4Generate({ formData, onGenerate, loading }: Step4GenerateProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review & Generate
        </h2>
        <p className="text-gray-600">
          Review your campaign details before generating
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiCheck className="text-green-600" />
          Campaign Summary
        </h3>

        <div className="space-y-4">
          {/* Campaign Name */}
          <div>
            <div className="text-sm text-gray-600 mb-1">Campaign Name</div>
            <div className="font-medium text-gray-900">{formData.name}</div>
          </div>

          {/* Source */}
          <div>
            <div className="text-sm text-gray-600 mb-1">Source</div>
            <div className="font-medium text-gray-900">
              {formData.sourceType === 'CUSTOM' ? (
                <>
                  <span className="inline-block mr-2">✏️</span>
                  Custom Description
                  {formData.sourceText && (
                    <div className="mt-2 text-sm font-normal text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                      {formData.sourceText}
                    </div>
                  )}
                </>
              ) : formData.sourceType === 'PRODUCT' ? (
                <>
                  <span className="inline-block mr-2">📦</span>
                  Existing Product
                </>
              ) : (
                <>
                  <span className="inline-block mr-2">🧩</span>
                  Content Block
                </>
              )}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <div className="text-sm text-gray-600 mb-2">Target Platforms</div>
            <div className="flex flex-wrap gap-2">
              {formData.platforms.map((platform) => (
                <span
                  key={platform}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700"
                >
                  <span>{platformIcons[platform]}</span>
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Tone & Goal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Tone</div>
              <div className="font-medium text-gray-900">
                {formData.tone.charAt(0) + formData.tone.slice(1).toLowerCase()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Goal</div>
              <div className="font-medium text-gray-900">
                {formData.goal.charAt(0) + formData.goal.slice(1).toLowerCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What to Expect */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">
          What will be generated?
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Platform-specific content</p>
              <p className="text-sm text-gray-600">
                Optimized posts for each selected platform with proper formatting and hashtags
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Multiple variations</p>
              <p className="text-sm text-gray-600">
                Different angles and messaging approaches for each platform
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Ready to schedule</p>
              <p className="text-sm text-gray-600">
                All assets will be ready to schedule or post immediately
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Generation Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          ⏱️ Generation typically takes 30-60 seconds. You'll be redirected to view your campaign assets once complete.
        </p>
      </div>

      {/* Generate Button (handled by parent) */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Generating your campaign...</p>
        </div>
      )}
    </div>
  );
}
