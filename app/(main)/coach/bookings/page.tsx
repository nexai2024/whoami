'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiMail, FiUser, FiDollarSign } = FiIcons;

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
};

export default function BookingsPage() {
  const user = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/handler/sign-in');
      return;
    }
    loadBookings();
  }, [user, filter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const url = filter === 'all'
        ? `/api/bookings?userId=${user?.id}`
        : `/api/bookings?userId=${user?.id}&status=${filter}`;
      
      const response = await fetch(url, {
        headers: { 'x-user-id': user?.id || '' },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings</h1>
        <p className="text-gray-600">View and manage your client bookings</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl border">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">No bookings found</p>
          </div>
        ) : (
          <div className="divide-y">
            {bookings.map((booking: any) => (
              <div key={booking?.id as string} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {(booking as any).customerName || (booking as any).customerEmail}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${(STATUS_COLORS as any)[(booking as any).status] || STATUS_COLORS.PENDING}`}>
                        {(booking as any).status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiCalendar />
                        {formatDate((booking as any).startTime)}
                      </div>
                      <div className="flex items-center gap-2">
                        <FiClock />
                        {formatTime((booking as any).startTime)} - {formatTime((booking as any).endTime)} ({(booking as any).duration} min)
                      </div>
                      <div className="flex items-center gap-2">
                        <FiMail />
                        {(booking as any).customerEmail}
                      </div>
                      {(booking as any).price && (
                        <div className="flex items-center gap-2">
                          <FiDollarSign />
                          {(booking as any).currency} {((booking as any).price as number).toFixed(2)}
                        </div>
                      )}
                      {(booking as any).notes && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-gray-700">{(booking as any).notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
