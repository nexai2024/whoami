/**
 * Client-side Analytics Service
 * Calls analytics API endpoints instead of using Prisma directly
 */

export class AnalyticsService {
  /**
   * Record a click event
   */
  static async recordClick(clickData: {
    pageId: string;
    blockId?: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
    country?: string;
    city?: string;
    device?: string;
    browser?: string;
    os?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
  }) {
   
    try {
      console.log('clickData', clickData);  
      const response = await fetch('/api/analytics/clicks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clickData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to record click');
      }

      return await response.json();
    } catch (error) {
      console.error('Error recording click:', error);
      throw error;
    }
  }

  /**
   * Get analytics data for a specific page
   */
  static async getPageAnalytics(pageId: string, days: number = 30) {
    try {
      const response = await fetch(
        `/api/analytics/page/${pageId}?days=${days}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch page analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching page analytics:', error);
      throw error;
    }
  }

  /**
   * Get analytics data for a user
   */
  static async getUserAnalytics(userId: string, days: number = 30) {
    try {
      const response = await fetch(
        `/api/analytics/user/${userId}?days=${days}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch user analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  /**
   * Get top performing blocks for a page
   */
  static async getTopPerformingBlocks(
    pageId: string | null,
    limit: number = 10,
    userId: string | null = null
  ) {
    try {
      const params = new URLSearchParams();
      if (pageId) params.append('pageId', pageId);
      if (userId) params.append('userId', userId);
      params.append('limit', limit.toString());

      const response = await fetch(
        `/api/analytics/top-blocks?${params.toString()}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch top blocks');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching top performing blocks:', error);
      throw error;
    }
  }
}
