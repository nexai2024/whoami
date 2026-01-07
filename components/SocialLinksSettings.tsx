import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiLinkedin,
  FiFacebook,
  FiTwitch,
  FiMessageSquare,
  FiGlobe,
  FiExternalLink,
  FiPlus,
  FiTrash2,
  FiSave,
  FiLoader
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { logger } from '../lib/utils/logger';
import { useUser } from '@stackframe/stack';

interface SocialLink {
  platform: string;
  url: string;
  icon: any;
  label: string;
  placeholder: string;
  color: string;
}

const SOCIAL_PLATFORMS: SocialLink[] = [
  {
    platform: 'twitter',
    url: '',
    icon: FiTwitter,
    label: 'Twitter / X',
    placeholder: 'https://x.com/username',
    color: 'hover:bg-gray-100 focus:ring-gray-500'
  },
  {
    platform: 'instagram',
    url: '',
    icon: FiInstagram,
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
    color: 'hover:bg-pink-50 focus:ring-pink-500'
  },
  {
    platform: 'youtube',
    url: '',
    icon: FiYoutube,
    label: 'YouTube',
    placeholder: 'https://youtube.com/@username',
    color: 'hover:bg-red-50 focus:ring-red-500'
  },
  {
    platform: 'tiktok',
    url: '',
    icon: FiGlobe,
    label: 'TikTok',
    placeholder: 'https://tiktok.com/@username',
    color: 'hover:bg-gray-100 focus:ring-gray-500'
  },
  {
    platform: 'linkedin',
    url: '',
    icon: FiLinkedin,
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
    color: 'hover:bg-blue-50 focus:ring-blue-500'
  },
  {
    platform: 'facebook',
    url: '',
    icon: FiFacebook,
    label: 'Facebook',
    placeholder: 'https://facebook.com/username',
    color: 'hover:bg-blue-50 focus:ring-blue-500'
  },
  {
    platform: 'twitch',
    url: '',
    icon: FiTwitch,
    label: 'Twitch',
    placeholder: 'https://twitch.tv/username',
    color: 'hover:bg-purple-50 focus:ring-purple-500'
  },
  {
    platform: 'discord',
    url: '',
    icon: FiMessageSquare,
    label: 'Discord',
    placeholder: 'https://discord.gg/invite-code',
    color: 'hover:bg-indigo-50 focus:ring-indigo-500'
  },
];

const SocialLinksSettings = () => {
  const stackUser = useUser();
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSocialLinks();
  }, [stackUser]);

  const loadSocialLinks = async () => {
    if (!stackUser?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/profiles/${stackUser.id}`, {
        headers: {
          'x-user-id': stackUser.id,
        },
      });

      if (response.ok) {
        const profile = await response.json();

        // Map social links from profile
        const links: Record<string, string> = {};
        if (profile.socialLinkTwitter) links.twitter = profile.socialLinkTwitter;
        if (profile.socialLinkInstagram) links.instagram = profile.socialLinkInstagram;
        if (profile.socialLinkYouTube) links.youtube = profile.socialLinkYouTube;
        if (profile.socialLinkTikTok) links.tiktok = profile.socialLinkTikTok;
        if (profile.socialLinkLinkedIn) links.linkedin = profile.socialLinkLinkedIn;
        if (profile.socialLinkFacebook) links.facebook = profile.socialLinkFacebook;
        if (profile.socialLinkTwitch) links.twitch = profile.socialLinkTwitch;
        if (profile.socialLinkDiscord) links.discord = profile.socialLinkDiscord;
        if (profile.socialLinkWebsite) links.website = profile.socialLinkWebsite;
        if (profile.socialLinkLinktree) links.linktree = profile.socialLinkLinktree;
        if (profile.socialLinkOther) links.other = profile.socialLinkOther;

        setSocialLinks(links);
      }
    } catch (error) {
      logger.error('Error loading social links:', error);
      toast.error('Failed to load social links');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: url
    }));
  };

  const handleSaveSocialLinks = async () => {
    if (!stackUser?.id) {
      toast.error('User not authenticated');
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
          socialLinkTwitter: socialLinks.twitter || null,
          socialLinkInstagram: socialLinks.instagram || null,
          socialLinkYouTube: socialLinks.youtube || null,
          socialLinkTikTok: socialLinks.tiktok || null,
          socialLinkLinkedIn: socialLinks.linkedin || null,
          socialLinkFacebook: socialLinks.facebook || null,
          socialLinkTwitch: socialLinks.twitch || null,
          socialLinkDiscord: socialLinks.discord || null,
          socialLinkWebsite: socialLinks.website || null,
          socialLinkLinktree: socialLinks.linktree || null,
          socialLinkOther: socialLinks.other || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save social links' }));
        throw new Error(errorData.error || 'Failed to save social links');
      }

      logger.info('Social links saved successfully');
      toast.success('Social links saved successfully!');
    } catch (error: unknown) {
      logger.error('Error saving social links:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save social links. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const hasAnyLinks = Object.values(socialLinks).some(url => url && url.trim() !== '');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Social Media Links</h3>
          <p className="text-gray-600 text-sm">
            Add your social media links to display them on your creator profile page.
            Your audience can easily find and follow you across all platforms.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveSocialLinks}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {saving ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5" />
              Save Links
            </>
          )}
        </motion.button>
      </div>

      {/* Preview Card */}
      {hasAnyLinks && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiExternalLink className="w-5 h-5 text-indigo-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Preview Your Links</h4>
              <p className="text-sm text-gray-600">Your creator page will display these links:</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {SOCIAL_PLATFORMS.filter(platform => socialLinks[platform.platform]).map((platform) => {
              const Icon = platform.icon;
              return (
                <a
                  key={platform.platform}
                  href={socialLinks[platform.platform]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all ${platform.color}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-gray-700">{platform.label}</span>
                </a>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Social Link Inputs */}
      <div className="space-y-4">
        {SOCIAL_PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const value = socialLinks[platform.platform] || '';

          return (
            <motion.div
              key={platform.platform}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: platform.platform.length * 0.02 }}
              className={`bg-white border-2 rounded-xl p-4 transition-all ${value ? 'border-indigo-300 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-gray-50 ${platform.color}`}>
                  <Icon className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    {platform.label}
                  </label>
                  <input
                    type="url"
                    value={value}
                    onChange={(e) => handleSocialLinkChange(platform.platform, e.target.value)}
                    placeholder={platform.placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                {value && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Open link"
                  >
                    <FiExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Links */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiGlobe className="w-5 h-5 text-blue-600" />
          Additional Links
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Personal Website
            </label>
            <input
              type="url"
              value={socialLinks.website || ''}
              onChange={(e) => handleSocialLinkChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Linktree or similar
            </label>
            <input
              type="url"
              value={socialLinks.linktree || ''}
              onChange={(e) => handleSocialLinkChange('linktree', e.target.value)}
              placeholder="https://linktree.com/username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Other Link
            </label>
            <input
              type="url"
              value={socialLinks.other || ''}
              onChange={(e) => handleSocialLinkChange('other', e.target.value)}
              placeholder="https://any-other-link.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Tips for Social Links</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Use complete URLs including https:// (e.g., https://twitter.com/username)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Only add links you want to display publicly on your creator page</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>Empty fields will not be displayed on your profile</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span>You can update these links anytime from your settings</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SocialLinksSettings;
