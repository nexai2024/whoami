import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import FileUpload from './FileUpload';
import { PageService } from '../lib/database/pages';
import { logger } from '../lib/utils/logger';
import toast from 'react-hot-toast';
import TemplateBrowser from './TemplateBrowser';

const { 
  FiUser, FiEdit3, FiMail, FiPhone, FiGlobe, FiMapPin, 
  FiBuilding, FiCamera, FiSave, FiEye, FiType, FiImage,
  FiInstagram, FiTwitter, FiLinkedin, FiFacebook, FiYoutube, FiLayout
} = FiIcons;

/**
 * @param {Object} props
 * @param {string} props.pageId - The ID of the page being customized.
 * @param {Object} [props.currentHeader] - The current header data to prefill the form.
 * @param {(headerData: Object) => void} [props.onSave] - Callback when header is saved.
 * @param {(headerData: Object) => void} [props.onPreview] - Callback to preview header.
 */

const HeaderCustomizer = ({ pageId, currentHeader, onSave, onPreview }) => {
  const [headerData, setHeaderData] = useState({
    id: '',
    displayName: '',
    title: '',
    company: '',
    bio: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    avatar: null,
    backgroundImage: null,
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: '',
      facebook: '',
      youtube: ''
    },
    headerStyle: 'minimal', // minimal, card, gradient, split
    showContactInfo: true,
    showSocialLinks: true,
    showLocation: true,
    customIntroduction: '',
    ...currentHeader
  });
console.log('Current Header:', currentHeader);
console.log('Header Data State:', headerData);
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const headerStyles = [
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple' },
    { id: 'card', name: 'Card Style', description: 'Contained with border' },
    { id: 'gradient', name: 'Gradient', description: 'Colorful background' },
    { id: 'split', name: 'Split Layout', description: 'Side-by-side layout' }
  ];

  const socialPlatforms = [
    { id: 'instagram', name: 'Instagram', icon: FiInstagram, placeholder: 'https://instagram.com/username' },
    { id: 'twitter', name: 'Twitter', icon: FiTwitter, placeholder: 'https://twitter.com/username' },
    { id: 'linkedin', name: 'LinkedIn', icon: FiLinkedin, placeholder: 'https://linkedin.com/in/username' },
    { id: 'facebook', name: 'Facebook', icon: FiFacebook, placeholder: 'https://facebook.com/username' },
    { id: 'youtube', name: 'YouTube', icon: FiYoutube, placeholder: 'https://youtube.com/c/username' }
  ];

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FiUser },
    { id: 'contact', label: 'Contact', icon: FiMail },
    { id: 'social', label: 'Social Links', icon: FiInstagram },
    { id: 'templates', label: 'Bio Templates', icon: FiLayout },
    { id: 'style', label: 'Style', icon: FiType },
    { id: 'preview', label: 'Preview', icon: FiEye }
  ];

  const handleInputChange = (field, value) => {
    setHeaderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setHeaderData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleAvatarUpload = (uploadedFile) => {
    setHeaderData(prev => ({
      ...prev,
      avatar: uploadedFile.url
    }));
  };

  const handleBackgroundUpload = (uploadedFile) => {
    setHeaderData(prev => ({
      ...prev,
      backgroundImage: uploadedFile.url
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await PageService.updatePageHeader(pageId, headerData);
      toast.success('Header saved successfully!');
      if (onSave) onSave(headerData);
      logger.info('Header saved successfully');
    } catch (error) {
      logger.error('Error saving header:', error);
      toast.error('Failed to save header. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            value={headerData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Your Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title/Role
          </label>
          <input
            type="text"
            value={headerData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Content Creator, Designer, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company/Organization
          </label>
          <input
            type="text"
            value={headerData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            placeholder="Company Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={headerData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="City, Country"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio/Description
        </label>
        <textarea
          value={headerData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell visitors about yourself..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Introduction
        </label>
        <textarea
          value={headerData.customIntroduction}
          onChange={(e) => handleInputChange('customIntroduction', e.target.value)}
          placeholder="Add a personal welcome message or call-to-action..."
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          This will appear below your bio as a highlighted message
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            {headerData.avatar && (
              <img
                src={headerData.avatar}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <FileUpload
              onUploadComplete={handleAvatarUpload}
              acceptedTypes={['image/*']}
              maxSize={2 * 1024 * 1024} // 2MB
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Image
          </label>
          <FileUpload
            onUploadComplete={handleBackgroundUpload}
            acceptedTypes={['image/*']}
            maxSize={5 * 1024 * 1024} // 5MB
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={headerData.showContactInfo}
            onChange={(e) => handleInputChange('showContactInfo', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Show contact info</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <SafeIcon name={undefined}  icon={FiMail} className="inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            value={headerData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <SafeIcon name={undefined}  icon={FiPhone} className="inline mr-2" />
            Phone Number
          </label>
          <input
            type="tel"
            value={headerData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <SafeIcon name={undefined}  icon={FiGlobe} className="inline mr-2" />
            Website URL
          </label>
          <input
            type="url"
            value={headerData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Privacy Notice</h4>
        <p className="text-sm text-blue-800">
          Only display contact information you're comfortable sharing publicly. 
          Consider using a business email and phone number if available.
        </p>
      </div>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Social Media Links</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={headerData.showSocialLinks}
            onChange={(e) => handleInputChange('showSocialLinks', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Show social links</span>
        </label>
      </div>

      <div className="space-y-4">
        {socialPlatforms.map((platform) => (
          <div key={platform.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon name={undefined}  icon={platform.icon} className="inline mr-2" />
              {platform.name}
            </label>
            <input
              type="url"
              value={headerData.socialLinks[platform.id]}
              onChange={(e) => handleSocialLinkChange(platform.id, e.target.value)}
              placeholder={platform.placeholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Pro Tip</h4>
        <p className="text-sm text-green-800">
          Add your most important social profiles first. They'll be displayed as clickable icons 
          in your header for easy access.
        </p>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-medium text-purple-900 mb-2">Bio Templates</h3>
        <p className="text-sm text-purple-800">
          Choose from professionally designed bio templates to quickly set up your profile.
          These templates include pre-written content that you can customize.
        </p>
      </div>
      
      <TemplateBrowser
        templateType="BIO_ONLY"
        pageId={pageId}
        onApply={(templateId) => {
          // Template will be applied and page will reload
          console.log('Bio template applied:', templateId);
        }}
        showAIGenerate={true}
      />
    </div>
  );

  const renderStyleOptions = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Header Style</h3>
        <div className="grid grid-cols-2 gap-4">
          {headerStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleInputChange('headerStyle', style.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                headerData.headerStyle === style.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-medium text-gray-900">{style.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Display Options</h4>
        
        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <span className="text-sm font-medium text-gray-700">Show Location</span>
            <p className="text-xs text-gray-500">Display location with map pin icon</p>
          </div>
          <input
            type="checkbox"
            checked={headerData.showLocation}
            onChange={(e) => handleInputChange('showLocation', e.target.checked)}
            className="ml-3"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <span className="text-sm font-medium text-gray-700">Show Contact Info</span>
            <p className="text-xs text-gray-500">Display email and phone in header</p>
          </div>
          <input
            type="checkbox"
            checked={headerData.showContactInfo}
            onChange={(e) => handleInputChange('showContactInfo', e.target.checked)}
            className="ml-3"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <span className="text-sm font-medium text-gray-700">Show Social Links</span>
            <p className="text-xs text-gray-500">Display social media icons</p>
          </div>
          <input
            type="checkbox"
            checked={headerData.showSocialLinks}
            onChange={(e) => handleInputChange('showSocialLinks', e.target.checked)}
            className="ml-3"
          />
        </label>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="bg-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Header Preview</h3>
        <HeaderPreview headerData={headerData} />
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {previewMode ? 'Exit Preview' : 'Full Preview'}
        </button>
        
        {onPreview && (
          <button
            onClick={() => onPreview(headerData)}
            className="flex-1 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            Preview in New Window
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Customize Header</h2>
        <button
          onClick={handleSave}
          disabled={saving || !headerData.displayName}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SafeIcon name={undefined}  icon={FiSave} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SafeIcon name={undefined}  icon={tab.icon} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >


            {activeTab === 'basic' && renderBasicInfo()}
            {activeTab === 'contact' && renderContactInfo()}
            {activeTab === 'social' && renderSocialLinks()}
            {activeTab === 'templates' && renderTemplates()}
            {activeTab === 'style' && renderStyleOptions()}
            {activeTab === 'preview' && renderPreview()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Header Preview Component
const HeaderPreview = ({ headerData }) => {
  const getSocialIcon = (platform) => {
    const iconMap = {
      instagram: FiInstagram,
      twitter: FiTwitter,
      linkedin: FiLinkedin,
      facebook: FiFacebook,
      youtube: FiYoutube
    };
    return iconMap[platform] || FiGlobe;
  };

  const getHeaderStyles = () => {
    const baseStyles = "p-6 rounded-lg";
    const styleMap = {
      minimal: "bg-white",
      card: "bg-white border border-gray-200 shadow-sm",
      gradient: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
      split: "bg-white border border-gray-200"
    };
    return `${baseStyles} ${styleMap[headerData.headerStyle] || styleMap.minimal}`;
  };

  const activeSocialLinks = Object.entries(headerData.socialLinks)
    .filter(([_, url]) => url.trim())
    .slice(0, 5); // Limit to 5 social links

  return (
    <div className={getHeaderStyles()}>
      {headerData.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 rounded-lg"
          style={{ backgroundImage: `url(${headerData.backgroundImage})` }}
        />
      )}
      
      <div className="relative z-10">
        <div className={headerData.headerStyle === 'split' ? 'flex items-center gap-6' : 'text-center'}>
          {/* Avatar */}
          {headerData.avatar && (
            <div className={`${headerData.headerStyle === 'split' ? 'w-20 h-20' : 'w-24 h-24 mx-auto'} mb-4 rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center`}>
              <img
                src={headerData.avatar}
                alt={headerData.displayName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1">
            {/* Name and Title */}
            <h1 className="text-2xl font-bold mb-1">
              {headerData.displayName || 'Your Name'}
            </h1>
            
            {headerData.title && (
              <p className="text-lg opacity-90 mb-2">{headerData.title}</p>
            )}

            {/* Company */}
            {headerData.company && (
              <div className="flex items-center gap-2 justify-center mb-2">
                <SafeIcon name={undefined}  icon={FiBuilding} className="text-sm" />
                <span className="text-sm">{headerData.company}</span>
              </div>
            )}

            {/* Location */}
            {headerData.location && headerData.showLocation && (
              <div className="flex items-center gap-2 justify-center mb-3">
                <SafeIcon name={undefined}  icon={FiMapPin} className="text-sm" />
                <span className="text-sm">{headerData.location}</span>
              </div>
            )}

            {/* Bio */}
            {headerData.bio && (
              <p className="text-sm opacity-80 mb-3 max-w-md mx-auto">{headerData.bio}</p>
            )}

            {/* Custom Introduction */}
            {headerData.customIntroduction && (
              <div className="bg-black bg-opacity-10 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium">{headerData.customIntroduction}</p>
              </div>
            )}

            {/* Contact Info */}
            {headerData.showContactInfo && (headerData.email || headerData.phone || headerData.website) && (
              <div className="flex flex-wrap items-center justify-center gap-4 mb-4 text-sm">
                {headerData.email && (
                  <a href={`mailto:${headerData.email}`} className="flex items-center gap-1 hover:underline">
                    <SafeIcon name={undefined}  icon={FiMail} />
                    {headerData.email}
                  </a>
                )}
                {headerData.phone && (
                  <a href={`tel:${headerData.phone}`} className="flex items-center gap-1 hover:underline">
                    <SafeIcon name={undefined}  icon={FiPhone} />
                    {headerData.phone}
                  </a>
                )}
                {headerData.website && (
                  <a href={headerData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                    <SafeIcon name={undefined}  icon={FiGlobe} />
                    Website
                  </a>
                )}
              </div>
            )}

            {/* Social Links */}
            {headerData.showSocialLinks && activeSocialLinks.length > 0 && (
              <div className="flex items-center justify-center gap-3">
                {activeSocialLinks.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-black bg-opacity-10 hover:bg-opacity-20 transition-colors"
                  >
                    <SafeIcon name={undefined}  icon={getSocialIcon(platform)} className="text-lg" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderCustomizer;
	
