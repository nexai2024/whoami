import { logger } from '../utils/logger.js';
import { generateSlug } from '../utils/slug.js';
import prisma from '../prisma.js';
export class PageService {
  static async getPageBySlug(slug) {
    try {
      const page = await fetch(`/api/slug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slug })
      });
      // if (!page.ok) {
      //   throw new Error('Failed to fetch page');
      // }
      const result = await page.json();
      logger.info(`Page loaded successfully: ${slug}`);
      console.log('Page data loaded:', result, slug);
      return result;
    } catch (error) {
      logger.error(`Error fetching page by slug ${slug}:`, error);
      throw error;
    }
  }

  static async getPageById(pageId, userId = null) {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add user ID header if provided (required for accessing unpublished pages)
      if (userId) {
        headers['x-user-id'] = userId;
      }

      const page = await fetch(`/api/pages/${pageId}`, {
        method: 'GET',
        headers,
      });
      if (!page.ok) {
        const errorData = await page.json().catch(() => ({ error: 'Page not found' }));
        throw new Error(errorData.error || 'Page not found');
      }
      const result = await page.json();
      logger.info(`Page loaded successfully: ${pageId}`);
      return result;
    } catch (error) {
      logger.error(`Error fetching page by id ${pageId}:`, error);
      throw error;
    }
  }

  static async createPage(userId, metadata = {}) {
    try {
      // Call the API to create a new page for the user
      // Rate limiting is handled server-side in the API route
      logger.info("Creating page for user:", userId);

      // Prepare request body with optional metadata
      const body = {};
      if (metadata.title) {
        body.title = metadata.title;
      }
      if (metadata.description) {
        body.description = metadata.description;
      }
      
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create page' }));
        logger.error('Failed to create page:', errorData);
        if (response.status === 403) {
          const err = new Error(errorData.error || 'Page limit reached');
          err.code = 'PAGE_LIMIT';
          err.limit = errorData.limit;
          err.remaining = errorData.remaining;
          err.resetAt = errorData.resetAt;
          throw err;
        }
        throw new Error(errorData.error || 'Failed to create page via API');
      }

      const result = await response.json();

      // Validate response structure
      if (!result || !result.id) {
        logger.error('Invalid response from page creation API:', result);
        throw new Error('Invalid response from server');
      }

      logger.info(`Page created via API: ${result.id}`);
      return result;
    } catch (error) {
      logger.error('Error creating page via API:', error);
      throw error;
    }

  }

  static async updatePage(pageId, updateData) {
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) {
        throw new Error('Failed to update page via API');
      }
      const result = await response.json();
      logger.info(`Page updated successfully: ${pageId}`);
      return {
        ...result,
        blocks: [],
        _count: { clicks: Math.floor(Math.random() * 1000) }
      };;
    } catch (error) {
      logger.error(`Error updating page ${pageId}:`, error);
      throw error;
    }
    // const page = await prisma.page.findUnique({
    //   where: { id: pageId },
    // });
    // if (!page) {
    //   throw new Error('Page not found');
    // }

    // const updatedPage = await prisma.page.update({
    //   where: { id: pageId },
    //   data: {
    //     ...updateData,
    //     updatedAt: new Date()
    //   }
    // });


    // } catch (error) {
    //   logger.error(`Error updating page ${pageId}:`, error);
    //   throw error;
    // }
  }

  static async updatePageHeader(pageId, headerData) {
    logger.info("Updating page header with data:", headerData);
    try {
      const result = await fetch(`/api/pages/${pageId}/header`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(headerData)
      });

      if (!result.ok) {
        throw new Error('Failed to update page header via API');
      }

      const updatedHeader = await result.json();
      logger.info(`Page header updated via API: ${pageId}`);
      return updatedHeader;
    } catch (error) {
      logger.error(`Error updating page header ${pageId}:`, error);
      throw error;
    }
  }

  static async deletePage(pageId) {
    try {
      await prisma.page.delete({
        where: { id: pageId },
      });

      // Delete associated blocks
      await prisma.block.deleteMany({
        where: { pageId },
      });

      logger.info(`Page deleted successfully: ${pageId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting page ${pageId}:`, error);
      throw error; 10
    }
  }

  static async getUserPages(userId) {
    //      const userId = await useAuth().userId;
    //  console.log("Creating page for user:", userId);
    try {
      const response = await fetch('/api/pages', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create page via API');
      }

      const result = await response.json();
      logger.info(`Pages fetched via API: ${result.length}`);
      return result;
    } catch (error) {
      logger.error(`Error fetching pages for user ${userId}:`, error);
      throw error;
    }
  }

  static async duplicatePage(pageId, userId) {
    try {
      const originalPage = await this.getPageById(pageId);

      const duplicatedPageId = `page_${Date.now()}`;
      const duplicatedPage = {
        ...originalPage,
        id: duplicatedPageId,
        userId,
        slug: await generateSlug(`${originalPage.title} Copy`),
        title: `${originalPage.title} (Copy)`,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      delete duplicatedPage.user;
      delete duplicatedPage.blocks;
      delete duplicatedPage._count;

      mockPages.set(duplicatedPageId, duplicatedPage);

      logger.info(`Page duplicated successfully: ${pageId} -> ${duplicatedPageId}`);
      return duplicatedPage;
    } catch (error) {
      logger.error(`Error duplicating page ${pageId}:`, error);
      throw error;
    }
  }
}