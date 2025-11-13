import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import * as FiIcons from 'react-icons/fi';
const { FiUser: FiUserIcon } = FiIcons;
import SafeIcon from '../common/SafeIcon';
import FileUpload from './FileUpload';
import DomainSubdomainSetup from './DomainSubdomainSetup';
import CoachSettings from './CoachSettings';
import { PageService } from '../lib/database/pages';
import { logger } from '../lib/utils/logger';
import { useUser } from '@stackframe/stack';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/common/RichTextEditor';
const { 
  FiUser, FiSettings, FiCreditCard, FiGlobe, FiShield, 
  FiMail, FiPhone, FiSave, FiTrash2, FiEye, FiEyeOff,
  FiUpgrade, FiDownload, FiKey, FiBell, FiLock
} = FiIcons;

const Settings = () => {
  const stackUser = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Check for tab from URL query params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'account', 'coach', 'billing', 'domains', 'privacy', 'notifications'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Listen for tab changes from sidebar
  useEffect(() => {
    const handleTabChange = (event) => {
      const tab = event.detail?.tab;
      if (tab) {
        setActiveTab(tab);
        router.replace(`/settings?tab=${tab}`, { scroll: false });
      }
    };
    
    window.addEventListener('settingsTabChange', handleTabChange);
    return () => window.removeEventListener('settingsTabChange', handleTabChange);
  }, [router]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userPages, setUserPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    bio: '',
    avatar: null,
    phone: '',
    website: '',
    location: '',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      marketing: false
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'account', label: 'Account', icon: FiSettings },
    { id: 'billing', label: 'Billing', icon: FiCreditCard },
    { id: 'coach', label: 'Coach', icon: FiUserIcon },
    { id: 'domains', label: 'Domains', icon: FiGlobe },
    { id: 'privacy', label: 'Privacy', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell }
  ];

  useEffect(() => {
    loadUserData();
    loadUserPages();
  }, [stackUser]);

  useEffect(() => {
    // Auto-select first page when pages are loaded
    if (userPages.length > 0 && !selectedPageId) {
      setSelectedPageId(userPages[0].id);
    }
  }, [userPages]);

  const loadUserPages = async () => {
    if (!stackUser?.id) return;
    try {
      const pages = await PageService.getUserPages(stackUser.id);
      setUserPages(pages);
    } catch (error) {
      logger.error('Error loading user pages:', error);
    }
  };

  const loadUserData = async () => {
    if (!stackUser) return;
    try {
      setLoading(true);
      setUser(stackUser);
      setFormData({
        displayName: stackUser.profile?.displayName || '',
        email: stackUser.primaryEmail || '',
        bio: stackUser.profile?.bio || '',
        avatar: stackUser.profile?.avatar || null,
        phone: stackUser.profile?.phone || '',
        website: stackUser.profile?.website || '',
        location: stackUser.profile?.location || '',
        timezone: stackUser.profile?.timezone || 'UTC',
        notifications: stackUser.profile?.notifications || {
          email: true,
          push: true,
          marketing: false
        }
      });
    } catch (error) {
      logger.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handleAvatarUpload = (uploadedFile) => {
    setFormData(prev => ({
      ...prev,
      avatar: uploadedFile.url
    }));
  };

  const handleSave = async () => {
    if (!stackUser?.id) {
      toast.error('You must be logged in to save settings');
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch(`/api/profiles/${stackUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': stackUser.id,
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          bio: formData.bio,
          avatar: formData.avatar,
          phone: formData.phone,
          website: formData.website,
          location: formData.location,
          timezone: formData.timezone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save settings' }));
        throw new Error(errorData.error || 'Failed to save settings');
      }

      const updatedProfile = await response.json();
      logger.info('User settings saved successfully');
      toast.success('Settings saved successfully!');
      
      // Reload user data to reflect changes
      loadUserData();
    } catch (error) {
      logger.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Your display name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="City, Country"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <RichTextEditor
          value={formData.bio}
          onChange={(content) => handleInputChange('bio', content)}
          placeholder="Tell us about yourself..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          {formData.avatar && (
            <img
              src={formData.avatar}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          )}
          <FileUpload
            onUploadComplete={handleAvatarUpload}
            acceptedTypes={['image/*']}
            maxSize={2 * 1024 * 1024}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">Account Status</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-700">
              Current Plan: <span className="font-semibold">{user?.profile?.plan || 'Free'}</span>
            </p>
            <p className="text-xs text-yellow-600">
              Account created: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <button className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
            <SafeIcon name={undefined}  icon={FiUpgrade} />
            Upgrade Plan
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Password & Security</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Confirm new password"
          />
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <SafeIcon name={undefined}  icon={FiKey} />
          Update Password
        </button>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
        <p className="text-gray-600 mb-4">
          Download all your data including pages, analytics, and user information.
        </p>
        <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          <SafeIcon name={undefined}  icon={FiDownload} />
          Export All Data
        </button>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            <SafeIcon name={undefined}  icon={FiTrash2} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-700">Email Notifications</span>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={formData.notifications.email}
              onChange={(e) => handleNotificationChange('email', e.target.checked)}
              className="h-4 w-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-700">Push Notifications</span>
              <p className="text-sm text-gray-500">Receive push notifications in browser</p>
            </div>
            <input
              type="checkbox"
              checked={formData.notifications.push}
              onChange={(e) => handleNotificationChange('push', e.target.checked)}
              className="h-4 w-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-700">Marketing Communications</span>
              <p className="text-sm text-gray-500">Receive product updates and tips</p>
            </div>
            <input
              type="checkbox"
              checked={formData.notifications.marketing}
              onChange={(e) => handleNotificationChange('marketing', e.target.checked)}
              className="h-4 w-4 text-indigo-600 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <SafeIcon name={undefined}  icon={FiSave} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'billing') {
                      router.push('/settings/billing');
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <SafeIcon name={undefined}  icon={tab.icon} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'account' && renderAccountTab()}
              {activeTab === 'coach' && <CoachSettings />}
              {activeTab === 'billing' && (
                <div className="text-center py-12">
                  <p className="text-gray-600">Redirecting to billing...</p>
                </div>
              )}
              {activeTab === 'domains' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Domain & Subdomain Setup</h2>
                    <p className="text-gray-600 mb-6">
                      Configure custom domains and subdomains for your pages. Each page can have its own domain or subdomain.
                    </p>
                    
                    {userPages.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <SafeIcon name={undefined} icon={FiGlobe} className="text-gray-400 text-4xl mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">You don't have any pages yet.</p>
                        <a
                          href="/builder?new=true"
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Create your first page →
                        </a>
                      </div>
                    ) : (
                      <>
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Page to Configure
                          </label>
                          <select
                            value={selectedPageId || ''}
                            onChange={(e) => setSelectedPageId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            {userPages.map((page) => (
                              <option key={page.id} value={page.id}>
                                {page.title} ({page.slug})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {selectedPageId && (
                          <DomainSubdomainSetup pageId={selectedPageId} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'privacy' && (
                <div className="text-center py-12">
                  <SafeIcon name={undefined}  icon={FiShield} className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600">Privacy settings coming soon</p>
                </div>
              )}
              {activeTab === 'notifications' && renderNotificationsTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;