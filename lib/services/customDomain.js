import { logger } from '../utils/logger.js';

export class CustomDomainService {
  /**
   * Setup custom domain for a page
   * @param {string} pageId - The page ID
   * @param {string} domain - The domain to set
   * @returns {Promise<{status: string, dnsRecords: Array, verificationToken: string}>}
   */
  static async setupCustomDomain(pageId, domain) {
    try {
      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        throw new Error('Invalid domain format');
      }

      // Call the API endpoint
      const response = await fetch(`/api/pages/${pageId}/domain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to setup domain');
      }

      const result = await response.json();

      // Generate DNS records for display
      const dnsRecords = [
        {
          type: 'CNAME',
          name: '@',
          value: 'whoami-bio.vercel.app', // Update with your actual target
          ttl: 3600
        },
        {
          type: 'TXT',
          name: '_whoami-verification',
          value: `whoami-domain-verification=${result.verificationToken}`,
          ttl: 300
        }
      ];

      logger.info(`Custom domain setup initiated for ${domain}`);

      return {
        status: result.customDomainStatus || 'pending',
        dnsRecords,
        verificationToken: result.verificationToken
      };

    } catch (error) {
      logger.error('Custom domain setup error:', error);
      throw error;
    }
  }

  /**
   * Check domain verification status
   * @param {string} pageId - The page ID
   * @param {string} domain - The domain to check
   * @returns {Promise<{status: string, dnsRecords: Array, lastChecked: string}>}
   */
  static async checkDomainStatus(pageId, domain) {
    try {
      // Trigger verification
      const verifyResponse = await fetch(`/api/pages/${pageId}/domain/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.error || 'Failed to check domain status');
      }

      const verifyResult = await verifyResponse.json();

      // Get current domain config
      const configResponse = await fetch(`/api/pages/${pageId}/domain`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let dnsRecords = [];
      if (verifyResult.status !== 'verified' && verifyResult.dnsRecords) {
        dnsRecords = [
          verifyResult.dnsRecords.cname,
          verifyResult.dnsRecords.txt
        ];
      }

      logger.info(`Domain status check for ${domain}: ${verifyResult.status}`);

      return {
        status: verifyResult.status,
        dnsRecords,
        lastChecked: new Date().toISOString(),
        cnameValid: verifyResult.cnameValid,
        txtValid: verifyResult.txtValid,
        errors: verifyResult.errors
      };

    } catch (error) {
      logger.error('Domain status check error:', error);
      return {
        status: 'failed',
        dnsRecords: [],
        error: error.message
      };
    }
  }

  /**
   * Remove custom domain
   * @param {string} pageId - The page ID
   * @param {string} domain - The domain to remove
   * @returns {Promise<boolean>}
   */
  static async removeCustomDomain(pageId, domain) {
    try {
      const response = await fetch(`/api/pages/${pageId}/domain`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove domain');
      }

      logger.info(`Custom domain removed for ${domain}`);
      return true;
    } catch (error) {
      logger.error('Domain removal error:', error);
      throw error;
    }
  }

  /**
   * Generate verification token (legacy method, kept for compatibility)
   * @deprecated Tokens are now generated server-side
   */
  static generateVerificationToken(pageId, domain) {
    const combined = `${pageId}-${domain}-${Date.now()}`;
    return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  /**
   * Validate domain ownership (legacy method, kept for compatibility)
   * @deprecated Validation now happens via DNS checks
   */
  static validateDomainOwnership(domain, verificationToken) {
    console.log('validateDomainOwnership', domain, verificationToken);
    return true;
  }
}