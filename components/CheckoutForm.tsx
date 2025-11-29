'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/utils/logger';

interface CheckoutFormProps {
  blockId: string;
  productTitle: string;
}

export default function CheckoutForm({ blockId, productTitle }: CheckoutFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);

    // Validate email
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsProcessing(true);

    try {
      // Payment processing not available
      setError('Payment processing is not currently available. Please contact support.');
    } catch (err: any) {
      logger.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          placeholder="your@email.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          required
          disabled={isProcessing}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-600 text-sm">
          Payment processing is not currently available. Please contact support to complete your purchase.
        </p>
      </div>

      {/* Submit Button - Disabled */}
      <button
        type="submit"
        disabled={true}
        className="w-full py-4 rounded-lg font-semibold text-white transition-all bg-gray-300 cursor-not-allowed"
      >
        Payment Unavailable
      </button>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        By completing this purchase, you agree to our terms of service.
      </p>
    </form>
  );
}
