'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { logger } from '@/lib/utils/logger';

interface CheckoutFormProps {
  blockId: string;
  productTitle: string;
}

export default function CheckoutForm({ blockId, productTitle }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
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

    // Check if Stripe.js has loaded
    if (!stripe || !elements) {
      setError('Payment system not ready. Please refresh the page.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const paymentIntentResponse = await fetch('/api/checkout/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockId,
          email,
        }),
      });

      if (!paymentIntentResponse.ok) {
        const errorData = await paymentIntentResponse.json();
        throw new Error(errorData.error || 'Failed to initialize payment');
      }

      const { clientSecret } = await paymentIntentResponse.json();

      // Confirm payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?session_id=${clientSecret}`,
          receipt_email: email,
        },
      });

      if (confirmError) {
        // Payment failed
        if (confirmError.type === 'card_error' || confirmError.type === 'validation_error') {
          setError(confirmError.message || 'Payment failed');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
        logger.error('Payment confirmation error:', confirmError);
      }
      // If successful, Stripe will redirect to return_url automatically
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

      {/* Payment Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-4">
          <PaymentElement />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
          isProcessing || !stripe
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Complete Purchase'
        )}
      </button>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        By completing this purchase, you agree to our terms of service.
      </p>
    </form>
  );
}
