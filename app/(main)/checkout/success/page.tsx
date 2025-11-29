'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiCheck } from 'react-icons/fi';

export default function CheckoutSuccessPage() {
  const router = useRouter();

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="text-3xl text-green-600" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Payment processing is not currently available. If you completed a purchase, please contact support for assistance.
        </p>

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
