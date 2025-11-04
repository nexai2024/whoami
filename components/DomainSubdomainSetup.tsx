'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './SafeIcon';
import toast from 'react-hot-toast';

const { FiGlobe, FiCheck, FiAlertCircle, FiCopy, FiRefreshCw, FiX } = FiIcons;

interface DomainSubdomainSetupProps {
  pageId: string;
}

interface DomainConfig {
  customDomain: string | null;
  customDomainStatus: string | null;
  customDomainVerifiedAt: string | null;
  subdomain: string | null;
}

interface DNSRecord {
  type: string;
  name: string;
  value: string;
  valid?: boolean;
}

const DomainSubdomainSetup: React.FC<DomainSubdomainSetupProps> = ({ pageId }) => {
  const [domainConfig, setDomainConfig] = useState<DomainConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  
  // Custom domain state
  const [customDomain, setCustomDomain] = useState('');
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  
  // Subdomain state
  const [subdomain, setSubdomain] = useState('');
  const [subdomainLoading, setSubdomainLoading] = useState(false);

  useEffect(() => {
    if (pageId) {
      loadDomainConfig();
    }
  }, [pageId]);

  const loadDomainConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pages/${pageId}/domain`);
      
      if (response.ok) {
        const config = await response.json();
        setDomainConfig(config);
        setCustomDomain(config.customDomain || '');
        setSubdomain(config.subdomain || '');
        
        // Load subdomain
        const subdomainResponse = await fetch(`/api/pages/${pageId}/subdomain`);
        if (subdomainResponse.ok) {
          const subdomainData = await subdomainResponse.json();
          setSubdomain(subdomainData.subdomain || '');
        }
      }
    } catch (error) {
      console.error('Error loading domain config:', error);
      toast.error('Failed to load domain configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSetCustomDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomain.trim()) return;

    try {
      setSubdomainLoading(true);
      const response = await fetch(`/api/pages/${pageId}/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set custom domain');
      }

      const result = await response.json();
      
      // Generate DNS records for display
      const records: DNSRecord[] = [
        {
          type: 'CNAME',
          name: '@',
          value: 'whoami-bio.vercel.app',
        },
        {
          type: 'TXT',
          name: '_whoami-verification',
          value: `whoami-domain-verification=${result.verificationToken}`,
        },
      ];

      setDnsRecords(records);
      setVerificationToken(result.verificationToken);
      setDomainConfig({
        ...domainConfig!,
        customDomain: result.customDomain,
        customDomainStatus: result.customDomainStatus,
      });
      
      toast.success('Custom domain added. Please configure DNS records.');
      await loadDomainConfig();
    } catch (error: any) {
      toast.error(error.message || 'Failed to set custom domain');
    } finally {
      setSubdomainLoading(false);
    }
  };

  const handleRemoveCustomDomain = async () => {
    if (!confirm('Are you sure you want to remove this custom domain?')) return;

    try {
      const response = await fetch(`/api/pages/${pageId}/domain`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove custom domain');
      }

      setDomainConfig({
        ...domainConfig!,
        customDomain: null,
        customDomainStatus: null,
        customDomainVerifiedAt: null,
      });
      setCustomDomain('');
      setDnsRecords([]);
      setVerificationToken(null);
      
      toast.success('Custom domain removed');
      await loadDomainConfig();
    } catch (error) {
      toast.error('Failed to remove custom domain');
    }
  };

  const handleVerifyDomain = async () => {
    try {
      setVerifying(true);
      const response = await fetch(`/api/pages/${pageId}/domain/verify`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to verify domain');
      }

      const result = await response.json();
      
      // Update DNS records with validation status
      if (result.dnsRecords) {
        setDnsRecords([
          result.dnsRecords.cname,
          result.dnsRecords.txt,
        ]);
      }

      setDomainConfig({
        ...domainConfig!,
        customDomainStatus: result.status,
        customDomainVerifiedAt: result.status === 'VERIFIED' ? new Date().toISOString() : null,
      });

      if (result.status === 'VERIFIED') {
        toast.success('Domain verified successfully!');
      } else {
        toast.error('Domain verification failed. Please check your DNS records.');
      }
    } catch (error) {
      toast.error('Failed to verify domain');
    } finally {
      setVerifying(false);
    }
  };

  const handleSetSubdomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain.trim()) return;

    try {
      setSubdomainLoading(true);
      const response = await fetch(`/api/pages/${pageId}/subdomain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: subdomain.toLowerCase().trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set subdomain');
      }

      const result = await response.json();
      setDomainConfig({
        ...domainConfig!,
        subdomain: result.subdomain,
      });
      
      toast.success(`Subdomain set! Your page: ${result.url}`);
      await loadDomainConfig();
    } catch (error: any) {
      toast.error(error.message || 'Failed to set subdomain');
    } finally {
      setSubdomainLoading(false);
    }
  };

  const handleRemoveSubdomain = async () => {
    if (!confirm('Are you sure you want to remove this subdomain?')) return;

    try {
      const response = await fetch(`/api/pages/${pageId}/subdomain`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove subdomain');
      }

      setDomainConfig({
        ...domainConfig!,
        subdomain: null,
      });
      setSubdomain('');
      
      toast.success('Subdomain removed');
      await loadDomainConfig();
    } catch (error) {
      toast.error('Failed to remove subdomain');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'VERIFIED': return 'text-green-600';
      case 'FAILED': return 'text-red-600';
      case 'PENDING': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'VERIFIED': return FiCheck;
      case 'FAILED': return FiAlertCircle;
      case 'PENDING': return FiRefreshCw;
      default: return FiGlobe;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom Domain Section */}
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

        {!domainConfig?.customDomain ? (
          <form onSubmit={handleSetCustomDomain} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain Name
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                  placeholder="example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={subdomainLoading}
                />
                <button
                  type="submit"
                  disabled={subdomainLoading || !customDomain.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subdomainLoading ? 'Setting up...' : 'Setup Domain'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <SafeIcon 
                  icon={getStatusIcon(domainConfig.customDomainStatus)} 
                  className={`text-lg ${getStatusColor(domainConfig.customDomainStatus)}`} 
                />
                <div>
                  <p className="font-medium text-gray-900">{domainConfig.customDomain}</p>
                  <p className={`text-sm capitalize ${getStatusColor(domainConfig.customDomainStatus)}`}>
                    {domainConfig.customDomainStatus || 'Pending'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {domainConfig.customDomainStatus !== 'VERIFIED' && (
                  <button
                    onClick={handleVerifyDomain}
                    disabled={verifying}
                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                    title="Verify domain"
                  >
                    <SafeIcon 
                      icon={FiRefreshCw} 
                      className={verifying ? 'animate-spin' : ''} 
                    />
                  </button>
                )}
                
                <button
                  onClick={handleRemoveCustomDomain}
                  className="p-2 text-red-600 hover:text-red-700 transition-colors"
                  title="Remove domain"
                >
                  <SafeIcon icon={FiX} />
                </button>
              </div>
            </div>

            {domainConfig.customDomainStatus === 'VERIFIED' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <SafeIcon icon={FiCheck} />
                  <p className="font-medium">Domain verified successfully!</p>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Your page is now accessible at {domainConfig.customDomain}
                </p>
              </div>
            )}
          </div>
        )}

        {/* DNS Configuration */}
        {dnsRecords.length > 0 && domainConfig?.customDomainStatus !== 'VERIFIED' && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              DNS Configuration Required
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Add these DNS records to your domain provider:
            </p>
            
            {dnsRecords.map((record, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
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
                {record.valid === false && (
                  <p className="text-red-600 text-xs mt-2">✗ This record is incorrect or missing</p>
                )}
                {record.valid === true && (
                  <p className="text-green-600 text-xs mt-2">✓ This record is correct</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subdomain Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <SafeIcon icon={FiGlobe} className="text-purple-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Subdomain</h2>
            <p className="text-gray-600">Get a custom subdomain for your page</p>
          </div>
        </div>

        {!domainConfig?.subdomain ? (
          <form onSubmit={handleSetSubdomain} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subdomain
              </label>
              <div className="flex gap-3">
                <div className="flex-1 flex items-center">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="my-page"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={subdomainLoading}
                  />
                  <span className="px-3 py-2 bg-gray-100 border-t border-r border-b border-gray-300 rounded-r-lg text-gray-600">
                    .whoami.click
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={subdomainLoading || !subdomain.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subdomainLoading ? 'Setting...' : 'Set Subdomain'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Use only lowercase letters, numbers, and hyphens (3-63 characters)
              </p>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  {domainConfig.subdomain}.whoami.click
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Your page is accessible at this URL
                </p>
              </div>
              
              <button
                onClick={handleRemoveSubdomain}
                className="p-2 text-red-600 hover:text-red-700 transition-colors"
                title="Remove subdomain"
              >
                <SafeIcon icon={FiX} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainSubdomainSetup;
