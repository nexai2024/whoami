import { logger } from '../utils/logger.js';

export class CustomDomainService {
  static async setupCustomDomain(pageId, domain) {
    try {
      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        throw new Error('Invalid domain format');
      }

      const dnsRecords = [
        {
          type: 'CNAME',
          name: domain === domain.split('.').slice(-2).join('.') ? '@' : domain.split('.')[0],
          value: 'whoami-bio.vercel.app',
          ttl: 3600
        },
        {
          type: 'TXT',
          name: '_whoami-verification',
          value: `whoami-domain-verification=${this.generateVerificationToken(pageId, domain)}`,
          ttl: 300
        }
      ];

      // Simulate API call to domain service
      await this.simulateApiCall();

      logger.info(`Custom domain setup initiated for ${domain}`);

      return {
        status: 'pending',
        dnsRecords,
        verificationToken: this.generateVerificationToken(pageId, domain)
      };

    } catch (error) {
      logger.error('Custom domain setup error:', error);
      throw error;
    }
  }

  static async checkDomainStatus(domain) {
    try {
      // Simulate DNS and SSL checks
      const dnsValid = await this.checkDnsRecords(domain);
      const sslValid = await this.checkSslCertificate(domain);

      let status = 'pending';
      if (dnsValid && sslValid) {
        status = 'verified';
      } else if (!dnsValid) {
        status = 'dns_pending';
      } else if (!sslValid) {
        status = 'ssl_pending';
      }

      const dnsRecords = status === 'verified' ? [] : [
        {
          type: 'CNAME',
          name: '@',
          value: 'whoami-bio.vercel.app'
        },
        {
          type: 'TXT',
          name: '_whoami-verification',
          value: `whoami-domain-verification=${this.generateVerificationToken('pageId', domain)}`
        }
      ];

      logger.info(`Domain status check for ${domain}: ${status}`);

      return {
        status,
        dnsRecords,
        lastChecked: new Date().toISOString()
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

  static async checkDnsRecords(domain) {
    try {
      await this.simulateApiCall(1000);
      // For demo purposes, simulate DNS validation
      return domain.length % 2 === 0;
    } catch (error) {
      logger.error('DNS check failed:', error);
      return false;
    }
  }

  static async checkSslCertificate(domain) {
    try {
      await this.simulateApiCall(800);
      return true;
    } catch (error) {
      logger.error('SSL check failed:', error);
      return false;
    }
  }

  static generateVerificationToken(pageId, domain) {
    const combined = `${pageId}-${domain}-${Date.now()}`;
    return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  static async removeCustomDomain(pageId, domain) {
    try {
      await this.simulateApiCall();
      logger.info(`Custom domain removed for ${domain}`);
      return true;
    } catch (error) {
      logger.error('Domain removal error:', error);
      throw error;
    }
  }

  static async simulateApiCall(delay = 500) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  static validateDomainOwnership(domain, verificationToken) {
    return true;
  }
}