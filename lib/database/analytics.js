import { logger } from '../utils/logger.js';

// Mock analytics data
const mockClicks = new Map();
const mockAnalytics = new Map();

export class AnalyticsService {
  static async recordClick(clickData) {
    try {
      const clickId = `click_${Date.now()}_${Math.random()}`;
      const click = {
        id: clickId,
        pageId: clickData.pageId,
        blockId: clickData.blockId || null,
        ipAddress: clickData.ipAddress || 'unknown',
        userAgent: clickData.userAgent || '',
        referer: clickData.referer || null,
        country: clickData.country || null,
        city: clickData.city || null,
        device: clickData.device || null,
        browser: clickData.browser || null,
        os: clickData.os || null,
        utmSource: clickData.utmSource || null,
        utmMedium: clickData.utmMedium || null,
        utmCampaign: clickData.utmCampaign || null,
        utmTerm: clickData.utmTerm || null,
        utmContent: clickData.utmContent || null,
        timestamp: new Date()
      };
      
      mockClicks.set(clickId, click);
      
      // Update daily analytics
      await this.updateDailyAnalytics(clickData.pageId, new Date());
      
      logger.info('Click recorded successfully:', clickId);
      return click;
    } catch (error) {
      logger.error('Error recording click:', error);
      throw error;
    }
  }

  static async updateDailyAnalytics(pageId, date) {
    try {
      const dateKey = date.toISOString().split('T')[0];
      const analyticsKey = `${pageId}_${dateKey}`;
      
      logger.info(`Daily analytics updated for page: ${pageId}`);
    } catch (error) {
      logger.error('Error updating daily analytics:', error);
    }
  }

  static async getPageAnalytics(pageId, days = 30) {
    try {
      // Generate mock analytics data
      const totalClicks = Math.floor(Math.random() * 10000);
      const uniqueVisitors = Math.floor(totalClicks * 0.7);
      
      // Generate daily chart data
      const dailyClicks = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dailyClicks.push({
          date: date.toISOString().split('T')[0],
          clicks: Math.floor(Math.random() * 100),
          unique_visitors: Math.floor(Math.random() * 70)
        });
      }
      
      return {
        totalClicks,
        uniqueVisitors,
        chartData: dailyClicks,
        deviceStats: {
          mobile: Math.floor(Math.random() * 60) + 40,
          desktop: Math.floor(Math.random() * 40) + 20,
          tablet: Math.floor(Math.random() * 20) + 5
        },
        browserStats: {
          Chrome: Math.floor(Math.random() * 50) + 30,
          Safari: Math.floor(Math.random() * 30) + 20,
          Firefox: Math.floor(Math.random() * 20) + 10,
          Edge: Math.floor(Math.random() * 15) + 5
        },
        countryStats: {
          'United States': Math.floor(Math.random() * 40) + 30,
          'United Kingdom': Math.floor(Math.random() * 20) + 10,
          'Canada': Math.floor(Math.random() * 15) + 8,
          'Germany': Math.floor(Math.random() * 12) + 5
        }
      };
    } catch (error) {
      logger.error(`Error fetching analytics for page ${pageId}:`, error);
      throw error;
    }
  }

  static async getUserAnalytics(userId, days = 30) {
    try {
      // Generate mock user analytics
      const totals = {
        pageViews: Math.floor(Math.random() * 50000) + 10000,
        uniqueVisitors: Math.floor(Math.random() * 30000) + 5000,
        totalClicks: Math.floor(Math.random() * 25000) + 3000,
        revenue: Math.floor(Math.random() * 5000) + 500
      };
      
      const daily = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        daily.push({
          date: date.toISOString().split('T')[0],
          pageViews: Math.floor(Math.random() * 200) + 50,
          uniqueVisitors: Math.floor(Math.random() * 150) + 30,
          totalClicks: Math.floor(Math.random() * 100) + 20,
          revenue: Math.floor(Math.random() * 50) + 10
        });
      }
      
      return { totals, daily };
    } catch (error) {
      logger.error(`Error fetching user analytics ${userId}:`, error);
      throw error;
    }
  }

  static async getTopPerformingBlocks(pageId, limit = 10) {
    try {
      // Generate mock top performing blocks
      const blocks = [
        { id: 'block_1', title: 'YouTube Channel', type: 'LINK', clicks: Math.floor(Math.random() * 1000) + 100 },
        { id: 'block_2', title: 'Digital Course', type: 'PRODUCT', clicks: Math.floor(Math.random() * 800) + 80 },
        { id: 'block_3', title: 'Newsletter', type: 'EMAIL_CAPTURE', clicks: Math.floor(Math.random() * 600) + 60 }
      ].slice(0, limit);
      
      return blocks;
    } catch (error) {
      logger.error(`Error fetching top blocks for page ${pageId}:`, error);
      throw error;
    }
  }

  static formatGroupByStats(stats) {
    return stats.reduce((acc, item) => {
      const key = item[Object.keys(item)[0]] || 'Unknown';
      acc[key] = item._count;
      return acc;
    }, {});
  }
}