import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { CustomDomainService } from '../lib/services/customDomain';
import { logger } from '../lib/utils/logger';
import toast from 'react-hot-toast';

const { FiGlobe, FiCheck, FiAlertCircle, FiCopy, FiRefreshCw } = FiIcons;

const CustomDomainSetup = ({ pageId, currentDomain, onDomainUpdate }) => {
  const [domain, setDomain] = useState(currentDomain || '');
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [dnsRecords, setDnsRecords] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentDomain) {
      checkDomainStatus();
    }
  }, [currentDomain]);

  const checkDomainStatus = async () => {
    try {
      setLoading(true);
      const status = await CustomDomainService.checkDomainStatus(currentDomain);
      setVerificationStatus(status.status);
      setDnsRecords(status.dnsRecords);
    } catch (err) {
      logger.error('Error checking domain status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDomainSubmit = async (e) => {
    e.preventDefault();
    if (!domain.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        throw new Error('Please enter a valid domain name (e.g., example.com)');
      }

      const result = await CustomDomainService.setupCustomDomain(pageId, domain);
      
      setVerificationStatus(result.status);
      setDnsRecords(result.dnsRecords);
      
      if (onDomainUpdate) {
        onDomainUpdate(domain);
      }

      logger.info(`Custom domain setup initiated: ${domain}`);
    } catch (err) {
      logger.error('Error setting up custom domain:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const retryVerification = async () => {
    if (!currentDomain) return;
    await checkDomainStatus();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return FiCheck;
      case 'failed': return FiAlertCircle;
      case 'pending': return FiRefreshCw;
      default: return FiGlobe;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <SafeIcon icon={FiGlobe} className="text-indigo-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Custom Domain</h2>
            <p className="text-gray-600">Connect your own domain to your page</p>
          </div>
        </div>

        {!currentDomain ? (
          <form onSubmit={handleDomainSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain Name
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.toLowerCase())}
                  placeholder="example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !domain.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Setting up...' : 'Setup Domain'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <SafeIcon 
                  icon={getStatusIcon(verificationStatus)} 
                  className={`text-lg ${getStatusColor(verificationStatus)}`} 
                />
                <div>
                  <p className="font-medium text-gray-900">{currentDomain}</p>
                  <p className={`text-sm capitalize ${getStatusColor(verificationStatus)}`}>
                    {verificationStatus}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {verificationStatus !== 'verified' && (
                  <button
                    onClick={retryVerification}
                    disabled={loading}
                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                    title="Check verification status"
                  >
                    <SafeIcon 
                      icon={FiRefreshCw} 
                      className={loading ? 'animate-spin' : ''} 
                    />
                  </button>
                )}
                
                <button
                  onClick={() => {
                    if (onDomainUpdate) onDomainUpdate(null);
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>

            {verificationStatus === 'verified' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <SafeIcon icon={FiCheck} />
                  <p className="font-medium">Domain verified successfully!</p>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Your page is now accessible at {currentDomain}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DNS Configuration */}
      {dnsRecords.length > 0 && verificationStatus !== 'verified' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            DNS Configuration Required
          </h3>
          <p className="text-gray-600 mb-4">
            Add these DNS records to your domain provider to verify ownership:
          </p>
          
          <div className="space-y-3">
            {dnsRecords.map((record, index) => (
              <motion.div
                key={index}
                className="p-4 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <p className="text-gray-900 font-mono">{record.type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-mono flex-1">{record.name}</p>
                      <button
                        onClick={() => copyToClipboard(record.name)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <SafeIcon icon={FiCopy} />
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Value:</span>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-mono flex-1 break-all">{record.value}</p>
                      <button
                        onClick={() => copyToClipboard(record.value)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <SafeIcon icon={FiCopy} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> DNS changes can take up to 24 hours to propagate. 
              You can check the verification status by clicking the refresh button above.
            </p>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Need Help?
        </h3>
        <div className="space-y-2 text-blue-800 text-sm">
          <p>• Make sure you own the domain and have access to DNS settings</p>
          <p>• DNS changes typically take 15 minutes to 24 hours to take effect</p>
          <p>• Contact your domain provider if you need help adding DNS records</p>
          <p>• Subdomains (like blog.example.com) are also supported</p>
        </div>
      </div>
    </div>
  );
};

export default CustomDomainSetup;