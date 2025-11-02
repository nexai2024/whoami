'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCheck, FiX } from 'react-icons/fi';
import { logger } from '@/lib/utils/logger';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setError('Invalid session');
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      // In a real implementation, you would verify the payment on the server
      // For now, we'll show a generic success message
      setPaymentDetails({
        status: 'paid',
        message: 'Your payment was successful!',
      });
    } catch (err) {
      logger.error('Error verifying payment:', err);
      setError('Could not verify payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    window.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="text-3xl text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleClose}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="text-3xl text-green-600" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. You'll receive an email confirmation shortly.
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-2">Order Details</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium text-green-600">Paid</span>
            </div>
            {sessionId && (
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-mono text-xs">{sessionId.substring(0, 20)}...</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all hover:shadow-lg"
          >
            Close Window
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
