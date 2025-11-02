'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiX } from 'react-icons/fi';

export default function CheckoutCancelPage() {
  const router = useRouter();

  const handleTryAgain = () => {
    router.back();
  };

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiX className="text-3xl text-gray-600" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Your payment was not completed. You can close this window or try again.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all hover:shadow-lg"
          >
            Try Again
          </button>
          <button
            onClick={handleClose}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
