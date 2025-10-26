'use client';

/**
 * OptInForm Component
 * Email capture form for lead magnet opt-ins
 */

import { useState } from 'react';

interface OptInFormProps {
  leadMagnetId: string;
  primaryColor?: string;
}

export default function OptInForm({ leadMagnetId, primaryColor = '#4F46E5' }: OptInFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!email || !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/lead-magnets/${leadMagnetId}/opt-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.error?.includes('already')) {
          throw new Error("You've already requested this! Check your email.");
        }
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Opt-in error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border-2 border-green-200">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Check your email! 📧</h3>
        <p className="text-gray-700 mb-2">
          We've sent your download link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-600">
          Check your inbox (and spam folder) for the download link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Name Field (Optional) */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Name (optional)
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-all"
          style={{ focusRingColor: primaryColor }}
          disabled={loading}
        />
      </div>

      {/* Email Field (Required) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          onBlur={handleEmailBlur}
          placeholder="your@email.com"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:outline-none transition-all ${
            emailError ? 'border-red-500' : 'border-gray-300'
          }`}
          style={{ focusRingColor: primaryColor }}
          required
          disabled={loading}
        />
        {emailError && (
          <p className="text-sm text-red-600 mt-1">{emailError}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !!emailError}
        className="w-full py-4 px-6 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100"
        style={{
          backgroundColor: primaryColor,
          opacity: loading || emailError ? 0.5 : 1,
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Sending...
          </span>
        ) : (
          'Get Instant Access →'
        )}
      </button>

      {/* Privacy Note */}
      <p className="text-xs text-gray-500 text-center">
        By submitting, you agree to receive emails from us. You can unsubscribe at any time.
      </p>
    </form>
  );
}
