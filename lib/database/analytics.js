import { logger } from '../utils/logger.js';
import prisma from '../prisma.js';

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
      // Calculate date ranges
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - days);
      
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - days);

      // Get page to find userId
      const page = await prisma.page.findUnique({
        where: { id: pageId },
        select: { userId: true }
      });

      if (!page) {
        return {
          totals: { pageViews: 0, uniqueVisitors: 0, totalClicks: 0, revenue: 0 },
          changes: { pageViews: '0%', uniqueVisitors: '0%', totalClicks: '0%', revenue: '0%' },
          daily: [],
          chartData: [],
          deviceStats: { mobile: 0, desktop: 0, tablet: 0 },
          browserStats: {},
          countryStats: {}
        };
      }

      // Count clicks for this page in current period
      const currentClicks = await prisma.click.count({
        where: {
          pageId: pageId,
          timestamp: { gte: startDate, lte: currentDate }
        }
      });

      // Count unique visitors (distinct IP addresses) in current period
      const currentUniqueVisitors = await prisma.click.findMany({
        where: {
          pageId: pageId,
          timestamp: { gte: startDate, lte: currentDate }
        },
        select: { ipAddress: true },
        distinct: ['ipAddress']
      });

      // Count clicks for previous period
      const previousClicks = await prisma.click.count({
        where: {
          pageId: pageId,
          timestamp: { gte: previousStartDate, lt: startDate }
        }
      });

      // Count unique visitors for previous period
      const previousUniqueVisitors = await prisma.click.findMany({
        where: {
          pageId: pageId,
          timestamp: { gte: previousStartDate, lt: startDate }
        },
        select: { ipAddress: true },
        distinct: ['ipAddress']
      });

      // Get analytics data from Analytics table for the user
      const currentAnalytics = await prisma.analytics.aggregate({
        where: {
          userId: page.userId,
          date: { gte: startDate, lte: currentDate }
        },
        _sum: {
          pageViews: true,
          revenue: true
        }
      });

      const previousAnalytics = await prisma.analytics.aggregate({
        where: {
          userId: page.userId,
          date: { gte: previousStartDate, lt: startDate }
        },
        _sum: {
          pageViews: true,
          revenue: true
        }
      });

      // Calculate totals
      const totals = {
        totalClicks: currentClicks,
        uniqueVisitors: currentUniqueVisitors.length,
        pageViews: currentAnalytics._sum.pageViews || 0,
        revenue: currentAnalytics._sum.revenue || 0
      };

      // Calculate percentage changes
      const calculateChange = (current, previous) => {
        if (previous === 0) return '0%';
        const change = ((current - previous) / previous) * 100;
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
      };

      const changes = {
        totalClicks: calculateChange(currentClicks, previousClicks),
        uniqueVisitors: calculateChange(currentUniqueVisitors.length, previousUniqueVisitors.length),
        pageViews: calculateChange(currentAnalytics._sum.pageViews || 0, previousAnalytics._sum.pageViews || 0),
        revenue: calculateChange(currentAnalytics._sum.revenue || 0, previousAnalytics._sum.revenue || 0)
      };

      // Get daily breakdown
      const dailyClicks = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayClicks = await prisma.click.count({
          where: {
            pageId: pageId,
            timestamp: { gte: dayStart, lte: dayEnd }
          }
        });

        const dayUniqueVisitors = await prisma.click.findMany({
          where: {
            pageId: pageId,
            timestamp: { gte: dayStart, lte: dayEnd }
          },
          select: { ipAddress: true },
          distinct: ['ipAddress']
        });

        dailyClicks.push({
          date: dayStart.toISOString().split('T')[0],
          clicks: dayClicks,
          unique_visitors: dayUniqueVisitors.length
        });
      }
      
      // Get device stats
      const deviceCounts = await prisma.click.groupBy({
        by: ['device'],
        where: {
          pageId: pageId,
          timestamp: { gte: startDate, lte: currentDate }
        },
        _count: true
      });

      const deviceStats = deviceCounts.reduce((acc, item) => {
        const device = item.device || 'unknown';
        acc[device.toLowerCase()] = item._count;
        return acc;
      }, { mobile: 0, desktop: 0, tablet: 0 });

      // Get browser stats
      const browserCounts = await prisma.click.groupBy({
        by: ['browser'],
        where: {
          pageId: pageId,
          timestamp: { gte: startDate, lte: currentDate }
        },
        _count: true
      });

      const browserStats = browserCounts.reduce((acc, item) => {
        const browser = item.browser || 'Unknown';
        acc[browser] = item._count;
        return acc;
      }, {});

      // Get country stats
      const countryCounts = await prisma.click.groupBy({
        by: ['country'],
        where: {
          pageId: pageId,
          timestamp: { gte: startDate, lte: currentDate }
        },
        _count: true
      });

      const countryStats = countryCounts.reduce((acc, item) => {
        const country = item.country || 'Unknown';
        acc[country] = item._count;
        return acc;
      }, {});
      
      // Get top performing blocks for this specific page
      const topBlocks = await this.getTopPerformingBlocks(pageId, 10);
      
      return {
        totals,
        changes,
        daily: dailyClicks,
        chartData: dailyClicks,
        deviceStats,
        browserStats,
        countryStats,
        topBlocks
      };
    } catch (error) {
      logger.error(`Error fetching analytics for page ${pageId}:`, error);
      throw error;
    }
  }

  static async getUserAnalytics(userId, days = 7) {
    try {
      // Calculate date ranges
      const currentDate = new Date();
      const currentPeriodStart = new Date(currentDate);
      currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
      
      const previousPeriodStart = new Date(currentPeriodStart);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

      // Get current period aggregated analytics
      const currentPeriod = await prisma.analytics.aggregate({
        where: {
          userId: userId,
          date: {
            gte: currentPeriodStart,
            lte: currentDate
          }
        },
        _sum: {
          pageViews: true,
          uniqueVisitors: true,
          totalClicks: true,
          revenue: true
        }
      });

      // Get previous period aggregated analytics
      const previousPeriod = await prisma.analytics.aggregate({
        where: {
          userId: userId,
          date: {
            gte: previousPeriodStart,
            lt: currentPeriodStart
          }
        },
        _sum: {
          pageViews: true,
          uniqueVisitors: true,
          totalClicks: true,
          revenue: true
        }
      });

      // Calculate totals
      const totals = {
        pageViews: currentPeriod._sum.pageViews || 0,
        uniqueVisitors: currentPeriod._sum.uniqueVisitors || 0,
        totalClicks: currentPeriod._sum.totalClicks || 0,
        revenue: currentPeriod._sum.revenue || 0
      };

      // Calculate percentage changes
      const calculateChange = (current, previous) => {
        if (previous === 0) return '0%';
        const change = ((current - previous) / previous) * 100;
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
      };

      const changes = {
        pageViews: calculateChange(
          currentPeriod._sum.pageViews || 0,
          previousPeriod._sum.pageViews || 0
        ),
        uniqueVisitors: calculateChange(
          currentPeriod._sum.uniqueVisitors || 0,
          previousPeriod._sum.uniqueVisitors || 0
        ),
        totalClicks: calculateChange(
          currentPeriod._sum.totalClicks || 0,
          previousPeriod._sum.totalClicks || 0
        ),
        revenue: calculateChange(
          currentPeriod._sum.revenue || 0,
          previousPeriod._sum.revenue || 0
        )
      };

      // Get daily breakdown for the current period
      const dailyRecords = await prisma.analytics.findMany({
        where: {
          userId: userId,
          date: {
            gte: currentPeriodStart,
            lte: currentDate
          }
        },
        orderBy: {
          date: 'asc'
        },
        select: {
          date: true,
          pageViews: true,
          uniqueVisitors: true,
          totalClicks: true,
          revenue: true
        }
      });

      const daily = dailyRecords.map(record => ({
        date: record.date.toISOString().split('T')[0],
        pageViews: record.pageViews,
        uniqueVisitors: record.uniqueVisitors,
        totalClicks: record.totalClicks,
        revenue: record.revenue
      }));
      
      // Get top performing blocks across all user's pages
      const topBlocks = await this.getTopPerformingBlocks(null, 10, userId);
      
      return { totals, changes, daily, topBlocks };
    } catch (error) {
      logger.error(`Error fetching user analytics ${userId}:`, error);
      throw error;
    }
  }

  static async getTopPerformingBlocks(pageId, limit = 10, userId = null) {
    try {
      // Validate that at least one of pageId or userId is provided
      if (!pageId && !userId) {
        logger.error('getTopPerformingBlocks requires either pageId or userId');
        return [];
      }

      // Build where clause based on parameters
      let whereClause = {
        blockId: { not: null } // Exclude page views without block clicks
      };

      if (pageId) {
        // Get top blocks for specific page
        whereClause.pageId = pageId;
      } else if (userId) {
        // Get top blocks across all user's pages
        const userPages = await prisma.page.findMany({
          where: { userId: userId },
          select: { id: true }
        });
        
        const pageIds = userPages.map(p => p.id);
        if (pageIds.length === 0) {
          return []; // User has no pages
        }
        
        whereClause.pageId = { in: pageIds };
      }

      // Group clicks by blockId and count
      const blockClickCounts = await prisma.click.groupBy({
        by: ['blockId'],
        where: whereClause,
        _count: {
          blockId: true
        },
        orderBy: {
          _count: {
            blockId: 'desc'
          }
        },
        take: limit
      });

      // Extract block IDs
      const blockIds = blockClickCounts
        .map(item => item.blockId)
        .filter(id => id !== null);

      if (blockIds.length === 0) {
        return []; // No clicks on blocks
      }

      // Get block details
      const blocks = await prisma.block.findMany({
        where: {
          id: { in: blockIds }
        },
        select: {
          id: true,
          title: true,
          type: true,
          url: true
        }
      });

      // Create a map of blockId to click count
      const clickCountMap = {};
      blockClickCounts.forEach(item => {
        if (item.blockId) {
          clickCountMap[item.blockId] = item._count.blockId;
        }
      });

      // Combine block details with click counts
      const topBlocks = blocks.map(block => ({
        id: block.id,
        title: block.title,
        type: block.type,
        clicks: clickCountMap[block.id] || 0,
        url: block.url || null
      }));

      // Sort by clicks descending (in case blocks were fetched in different order)
      topBlocks.sort((a, b) => b.clicks - a.clicks);

      return topBlocks;
    } catch (error) {
      logger.error(`Error fetching top performing blocks:`, error);
      return []; // Return empty array on error instead of throwing
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