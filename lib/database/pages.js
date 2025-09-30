import { logger } from '../utils/logger.js';
import { generateSlug } from '../utils/slug.js';
import prisma from '../prisma.js';
import { useAuth } from '@/lib/auth/AuthContext';
export class PageService {
  static async getPageBySlug(slug) {
    try {
      const page = await prisma.page.findUnique({
        where: { slug },
      });
      if (!page) {
        throw new Error('Page not found');
      }
            if (!page.isActive) {
        throw new Error('Page is not published');
      }
      
      // Get user data
      //const { UserService } = await import('./users.js');
      //const user = await UserService.getUserById(page.userId);
      //get page header
      const pageHeader = await prisma.pageHeader.findUnique({
        where: { pageId: page.id },
      });
      if (!pageHeader) {
        throw new Error('Page header not found');
      }
      // Get blocks
      const blocks = await prisma.block.findMany({
        where: { pageId: page.id, isActive: true },
        orderBy: { position: 'asc' }
      });
      
      const pageWithData = {
        ...page,
        pageHeader,
        blocks,
        _count: { clicks: Math.floor(Math.random() * 1000) }
      };
      
      logger.info(`Page loaded successfully: ${slug}`);
      return pageWithData;
    } catch (error) {
      logger.error(`Error fetching page by slug ${slug}:`, error);
      throw error;
    }
  }

  static async getPageById(pageId) {
    try {
      const page =  await prisma.page.findUnique({
        where: { id: pageId },
      });
      if (!page) {
        throw new Error('Page not found');
      }
      
      // Get page header
      const pageHeader = await prisma.pageHeader.findUnique({
        where: { pageId: page.id },
      });
      if (!pageHeader) {
        throw new Error('Page header not found');
      }
      
      //const user = await UserService.getUserById(page.userId);
      
      // Get blocks
      const blocks = await prisma.block.findMany({
        where: { pageId: page.id },
        orderBy: { position: 'asc' }
      });
      
      logger.info(`Page loaded successfully: ${pageId}`);
      
      return {
        ...page,
        pageHeader,
        blocks,
        _count: { clicks: Math.floor(Math.random() * 1000) }
      };
    } catch (error) {
      logger.error(`Error fetching page ${pageId}:`, error);
      throw error;
    }
  }

  static async createPage(userId) {
try {
  // Call the API to create a new page for the user
     const userId = await useAuth().userId;
     console.log("Creating page for user:", userId);
  const response = await fetch('/api/pages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    throw new Error('Failed to create page via API');
  }

  const result = await response.json();
  logger.info(`Page created via API: ${result.id}`);
  return result;
} catch (error) {
  logger.error('Error creating page via API:', error);
  throw error;
}
 
  }

  static async updatePage(pageId, updateData) {
    try {
      const page = await prisma.page.findUnique({
        where: { id: pageId },
      });
      if (!page) {
        throw new Error('Page not found');
      }
      
      const updatedPage = await prisma.page.update({
        where: { id: pageId },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

    logger.info(`Page updated successfully: ${pageId}`);
    return {
        ...updatedPage,
        blocks: [],
        _count: { clicks: Math.floor(Math.random() * 1000) }
      };
    } catch (error) {
      logger.error(`Error updating page ${pageId}:`, error);
      throw error;
    }
  }

  static async updatePageHeader(pageId, headerData) {
    logger.info("Updating page header with data:", headerData);
    try {
      const pageHeader = await prisma.pageHeader.findUnique({
        where: { pageId },
      });
      //const pageHeader =
      
    
      if (!pageHeader) {
        throw new Error('Page Header not found');
      }
      
      const updatedPageHeader = await prisma.pageHeader.update({
        where: { pageId },
        where: { id: headerData.id },
        data: {
          data: headerData,
          updatedAt: new Date()
        }
      });



      logger.info(`Page header updated successfully: for page ${pageId} with header ${headerData.id}`);
      return updatedPageHeader;
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
      throw error;10
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
  logger.info(`Page created via API: ${result.id}`);
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