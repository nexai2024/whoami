'use client';

/**
 * Campaign Wizard - Step 3: Customize
 * Select tone and goal for the campaign
 */

interface FormData {
  tone: 'PROFESSIONAL' | 'CASUAL' | 'EXCITED' | 'EDUCATIONAL';
  goal: 'LAUNCH' | 'PROMOTION' | 'ENGAGEMENT';
}

interface Step3CustomizeProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

const tones = [
  {
    id: 'PROFESSIONAL' as const,
    label: 'Professional',
    icon: '💼',
    description: 'Formal and business-oriented',
  },
  {
    id: 'CASUAL' as const,
    label: 'Casual',
    icon: '😊',
    description: 'Friendly and conversational',
  },
  {
    id: 'EXCITED' as const,
    label: 'Excited',
    icon: '🎉',
    description: 'Energetic and enthusiastic',
  },
  {
    id: 'EDUCATIONAL' as const,
    label: 'Educational',
    icon: '📚',
    description: 'Informative and instructional',
  },
];

const goals = [
  {
    id: 'LAUNCH' as const,
    label: 'Launch',
    icon: '🚀',
    description: 'Introducing new product/offer',
  },
  {
    id: 'PROMOTION' as const,
    label: 'Promotion',
    icon: '🏷️',
    description: 'Limited-time offer or discount',
  },
  {
    id: 'ENGAGEMENT' as const,
    label: 'Engagement',
    icon: '💬',
    description: 'Building community interaction',
  },
];

export default function Step3Customize({ formData, updateFormData }: Step3CustomizeProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Customize Your Campaign
        </h2>
        <p className="text-gray-600">
          Set the tone and goal to match your marketing objectives
        </p>
      </div>

      {/* Tone Selection */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Campaign Tone *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tones.map((tone) => {
            const isSelected = formData.tone === tone.id;

            return (
              <button
                key={tone.id}
                type="button"
                onClick={() => updateFormData({ tone: tone.id })}
                className={`p-5 border-2 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{tone.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {tone.label}
                    </h3>
                    <p className="text-sm text-gray-600">{tone.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-white"
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
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Goal Selection */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          Campaign Goal *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const isSelected = formData.goal === goal.id;

            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => updateFormData({ goal: goal.id })}
                className={`p-5 border-2 rounded-lg text-center transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
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
                <div className="text-4xl mb-3">{goal.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{goal.label}</h3>
                <p className="text-sm text-gray-600">{goal.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Campaign Preview</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Tone:</span>
            <span className="font-medium text-gray-900">
              {tones.find((t) => t.id === formData.tone)?.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Goal:</span>
            <span className="font-medium text-gray-900">
              {goals.find((g) => g.id === formData.goal)?.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
