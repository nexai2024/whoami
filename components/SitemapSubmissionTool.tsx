"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';

const {
  FiGlobe,
  FiCheckCircle,
  FiExternalLink,
  FiCopy,
  FiAlertCircle,
  FiInfo
} = FiIcons;

const SitemapSubmissionTool: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const sitemapUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/sitemap.xml`
    : '/api/sitemap.xml';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sitemapUrl);
    setCopied(true);
    toast.success('Sitemap URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const submissionInstructions = [
    {
      platform: 'Google Search Console',
      steps: [
        'Go to Google Search Console',
        'Select your property',
        'Navigate to Sitemaps in the left menu',
        'Enter your sitemap URL',
        'Click Submit'
      ],
      link: 'https://search.google.com/search-console'
    },
    {
      platform: 'Bing Webmaster Tools',
      steps: [
        'Go to Bing Webmaster Tools',
        'Select your site',
        'Go to Sitemaps section',
        'Enter your sitemap URL',
        'Click Submit'
      ],
      link: 'https://www.bing.com/webmasters'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FiGlobe className="text-indigo-600" />
          Sitemap Submission
        </h3>
        <p className="text-sm text-gray-600">
          Submit your sitemap to search engines to help them discover and index your pages faster.
        </p>
      </div>

      {/* Sitemap URL */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Sitemap URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={sitemapUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            {copied ? (
              <>
                <FiCheckCircle />
                Copied!
              </>
            ) : (
              <>
                <FiCopy />
                Copy
              </>
            )}
          </button>
          <a
            href={sitemapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FiExternalLink />
            View
          </a>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiInfo className="text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">About Sitemaps</h4>
            <p className="text-sm text-blue-800">
              Your sitemap is automatically updated when you publish or update pages. 
              You only need to submit it once to each search engine. After submission, 
              search engines will check it periodically for updates.
            </p>
          </div>
        </div>
      </div>

      {/* Submission Instructions */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">How to Submit</h4>
        {submissionInstructions.map((platform, index) => (
          <motion.div
            key={platform.platform}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">{platform.platform}</h5>
              <a
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
              >
                Open
                <FiExternalLink className="text-xs" />
              </a>
            </div>
            <ol className="space-y-2">
              {platform.steps.map((step, stepIndex) => (
                <li key={stepIndex} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-medium">
                    {stepIndex + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        ))}
      </div>

      {/* Verification Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <FiCheckCircle className="text-green-600" />
          <div>
            <p className="font-medium text-green-900">Sitemap is Live</p>
            <p className="text-sm text-green-700">
              Your sitemap is accessible and ready for submission
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapSubmissionTool;


