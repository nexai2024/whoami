'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiCheckCircle, FiCalendar, FiClock, FiUser, FiMail, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      // Note: This would typically require authentication
      // For now, we'll show a generic confirmation
      // In production, you'd fetch the booking by ID with proper auth
      setBooking({
        id: bookingId,
        status: 'CONFIRMED'
      });
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-green-600 text-4xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">
              Your booking has been successfully confirmed. You'll receive a confirmation email shortly.
            </p>
          </div>

          {booking && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-indigo-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-medium text-gray-900">{booking.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="text-green-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium text-green-600 capitalize">{booking.status}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Check your email for booking details and calendar invite.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

