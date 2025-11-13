'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';
import RichTextEditor from '@/components/common/RichTextEditor';

const { FiUser, FiCalendar, FiPackage, FiSave, FiLink } = FiIcons;

export default function CoachSettings() {
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    isCoach: false,
    coachSlug: '',
    bookingEnabled: false,
    productsEnabled: false,
    displayName: '',
    bio: '',
  });

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profiles/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          isCoach: data.isCoach || false,
          coachSlug: data.coachSlug || '',
          bookingEnabled: data.bookingEnabled || false,
          productsEnabled: data.productsEnabled || false,
          displayName: data.displayName || '',
          bio: data.bio || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/profiles/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Coach settings saved successfully!');
        loadProfile();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = () => {
    const slug = (formData.displayName || user?.primaryEmail?.split('@')[0] || 'coach')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData({ ...formData, coachSlug: slug });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading coach settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coach Settings</h2>
        <p className="text-gray-600">Enable coach features and configure your public profile</p>
      </div>

      {/* Enable Coach */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Enable Coach Mode</h3>
            <p className="text-sm text-gray-600">Activate coach features like bookings and products</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isCoach}
              onChange={(e) => setFormData({ ...formData, isCoach: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      {formData.isCoach && (
        <>
          {/* Coach Profile */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Coach Profile</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <RichTextEditor
                value={formData.bio || ''}
                onChange={(content) => setFormData({ ...formData, bio: content })}
                placeholder="Tell people about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coach URL Slug
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.coachSlug}
                  onChange={(e) => setFormData({ ...formData, coachSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="your-coach-slug"
                />
                <button
                  onClick={generateSlug}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Generate
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your coach profile will be available at: /{formData.coachSlug || 'your-slug'}
              </p>
            </div>
          </div>

          {/* Coach Features */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Features</h3>
            
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <FiCalendar className="text-indigo-600" />
                <div>
                  <div className="font-medium text-gray-900">Enable Bookings</div>
                  <div className="text-sm text-gray-600">Allow clients to book sessions with you</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.bookingEnabled}
                onChange={(e) => setFormData({ ...formData, bookingEnabled: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <FiPackage className="text-indigo-600" />
                <div>
                  <div className="font-medium text-gray-900">Enable Products</div>
                  <div className="text-sm text-gray-600">Sell products and packages</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.productsEnabled}
                onChange={(e) => setFormData({ ...formData, productsEnabled: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </label>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
