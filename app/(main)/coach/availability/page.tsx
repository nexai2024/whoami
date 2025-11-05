'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiX, FiPlus, FiSave, FiTrash2 } = FiIcons;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityPage() {
  const user = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [windows, setWindows] = useState([]);
  const [blackouts, setBlackouts] = useState([]);
  const [showWindowForm, setShowWindowForm] = useState(false);
  const [showBlackoutForm, setShowBlackoutForm] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'America/New_York',
    isActive: true,
  });
  const [blackoutData, setBlackoutData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/handler/sign-in');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [windowsRes, blackoutsRes] = await Promise.all([
        fetch(`/api/availability/windows?userId=${user?.id}`, {
          headers: new Headers({ 'x-user-id': user?.id || '' }),
        }),
        fetch(`/api/availability/blackouts?userId=${user?.id}`, {
          headers: new Headers({ 'x-user-id': user?.id || '' }),
        }),
      ]);

      if (windowsRes.ok) {
        const data = await windowsRes.json();
        setWindows(data.windows || []);
      }

      if (blackoutsRes.ok) {
        const data = await blackoutsRes.json();
        setBlackouts(data.blackouts || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWindow = async () => {
    try {
      const response = await fetch('/api/availability/windows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Availability window created!');
        setShowWindowForm(false);
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create window');
      }
    } catch (error) {
      toast.error('Failed to create availability window');
    }
  };

  const handleDeleteWindow = async (id: any) => {
    if (!confirm('Delete this availability window?')) return;

    try {
      const response = await fetch(`/api/availability/windows/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || '' },
      });

      if (response.ok) {
        toast.success('Window deleted!');
        loadData();
      }
    } catch (error) {
      toast.error('Failed to delete window');
    }
  };

  const handleCreateBlackout = async () => {
    try {
      const response = await fetch('/api/availability/blackouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          startDate: new Date(blackoutData.startDate).toISOString(),
          endDate: new Date(blackoutData.endDate).toISOString(),
          reason: blackoutData.reason,
        }),
      });

      if (response.ok) {
        toast.success('Blackout date created!');
        setShowBlackoutForm(false);
        setBlackoutData({ startDate: '', endDate: '', reason: '' });
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create blackout');
      }
    } catch (error) {
      toast.error('Failed to create blackout date');
    }
  };

  const handleDeleteBlackout = async (id: any) => {
    if (!confirm('Delete this blackout date?')) return;

    try {
      const response = await fetch(`/api/availability/blackouts/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || '' },
      });

      if (response.ok) {
        toast.success('Blackout deleted!');
        loadData();
      }
    } catch (error) {
      toast.error('Failed to delete blackout');
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Availability Management</h1>
        <p className="text-gray-600">Set your available hours and blackout dates</p>
      </div>

      {/* Availability Windows */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Weekly Availability</h2>
          <button
            onClick={() => setShowWindowForm(!showWindowForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiPlus />
            Add Window
          </button>
        </div>

        {showWindowForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateWindow}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowWindowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {windows.map((window: {
            id: number | string;
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            isActive: boolean;
          }) => (
            <div
              key={window.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <div className="font-medium">{DAYS[window.dayOfWeek]}</div>
                <div className="text-sm text-gray-600">
                  {window.startTime} - {window.endTime} ({window.isActive ? "Active" : "Inactive"})
                </div>
              </div>
              <button
                onClick={() => handleDeleteWindow((window as any).id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
          {windows.length === 0 && (
            <p className="text-gray-500 text-center py-8">No availability windows set</p>
          )}
        </div>
      </div>

      {/* Blackout Dates */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Blackout Dates</h2>
          <button
            onClick={() => setShowBlackoutForm(!showBlackoutForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiPlus />
            Add Blackout
          </button>
        </div>

        {showBlackoutForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={blackoutData.startDate}
                  onChange={(e) => setBlackoutData({ ...blackoutData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={blackoutData.endDate}
                  onChange={(e) => setBlackoutData({ ...blackoutData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
              <input
                type="text"
                value={blackoutData.reason}
                onChange={(e) => setBlackoutData({ ...blackoutData, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Holiday, Vacation, etc."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateBlackout}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowBlackoutForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {blackouts.map((blackout: { id: string | number; startDate: string; endDate: string; reason?: string }) => (
            <div
              key={blackout.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <div className="font-medium">
                  {new Date(blackout.startDate).toLocaleDateString()} - {new Date(blackout.endDate).toLocaleDateString()}
                </div>
                {blackout.reason && (
                  <div className="text-sm text-gray-600">{blackout.reason}</div>
                )}
              </div>
              <button
                onClick={() => handleDeleteBlackout(blackout.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
          {blackouts.length === 0 && (
            <p className="text-gray-500 text-center py-8">No blackout dates set</p>
          )}
        </div>
      </div>
    </div>
  );
}
