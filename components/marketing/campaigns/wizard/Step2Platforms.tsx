'use client';

/**
 * Campaign Wizard - Step 2: Platform Selection
 * Select target platforms for campaign distribution
 */

import { FiTwitter, FiInstagram, FiLinkedin, FiFacebook, FiMusic, FiMail } from 'react-icons/fi';

interface FormData {
  platforms: string[];
}

interface Step2PlatformsProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

const platforms = [
  { id: 'TWITTER', name: 'Twitter', icon: FiTwitter, description: 'Threads and posts' },
  { id: 'INSTAGRAM', name: 'Instagram', icon: FiInstagram, description: 'Stories and captions' },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: FiLinkedin, description: 'Professional posts' },
  { id: 'FACEBOOK', name: 'Facebook', icon: FiFacebook, description: 'Engaging posts' },
  { id: 'TIKTOK', name: 'TikTok', icon: FiMusic, description: 'Short video scripts' },
  { id: 'EMAIL', name: 'Email', icon: FiMail, description: 'Email sequences' },
];

export default function Step2Platforms({ formData, updateFormData }: Step2PlatformsProps) {
  const togglePlatform = (platformId: string) => {
    const newPlatforms = formData.platforms.includes(platformId)
      ? formData.platforms.filter((p) => p !== platformId)
      : [...formData.platforms, platformId];
    updateFormData({ platforms: newPlatforms });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Target Platforms
        </h2>
        <p className="text-gray-600">
          Select all platforms where you want to distribute this campaign
        </p>
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 We'll generate optimized content for each platform. Select at least one platform to continue.
        </p>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = formData.platforms.includes(platform.id);

          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => togglePlatform(platform.id)}
              className={`relative p-6 border-2 rounded-lg text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Checkmark Overlay */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-3 rounded-lg ${
                    isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">{platform.name}</h3>
              </div>

              <p className="text-sm text-gray-600">{platform.description}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Count */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {formData.platforms.length === 0 ? (
            <span className="text-red-600 font-medium">
              Please select at least one platform
            </span>
          ) : (
            <span className="text-green-600 font-medium">
              ✓ {formData.platforms.length} platform{formData.platforms.length !== 1 ? 's' : ''} selected
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
