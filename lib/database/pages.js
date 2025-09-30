import { logger } from '../utils/logger.js';
import { generateSlug } from '../utils/slug.js';
import prisma from '../prisma.js';

// Mock database for demo purposes
// const mockPages = new Map();
// const mockHeadeers = new Map();
// const mockBlocks = new Map();

// // Initialize with demo data
// mockPages.set('page_1', {
//   id: 'page_1',
//   userId: 'user_1',
//   slug: 'demo-user',
//   title: 'My Awesome Page',
//   description: 'Welcome to my digital hub',
//   isActive: true,
//   customDomain: null,
//   metaTitle: 'Demo User - My Links',
//   metaDescription: 'Check out my latest content and projects',
//   ogImage: null,
//   backgroundColor: '#ffffff',
//   textColor: '#000000',
//   buttonStyle: 'rounded',
//   fontFamily: 'inter',
//   googleAnalyticsId: null,
//   facebookPixelId: null,
//   createdAt: new Date('2024-01-01'),
//   updatedAt: new Date()
// });

// mockHeaders.set('header_1', {
//   id: 'header_1',
//   pageId: 'page_1',
//   data: {
//     logoUrl: null,
//     displayName: 'Demo User',
//     bio: 'Web developer and content creator',
//     location: 'San Francisco, CA',
//     contactEmail: 'demo@user.com',
//     phoneNumber: null,
//     socialLinks: {
//       github: 'https://github.com/demouser',
//       twitter: 'https://twitter.com/demouser',
//       linkedin: 'https://linkedin.com/in/demouser'
//     },
//     headerStyle: 'minimal', // minimal, card, gradient, split
//     showContactInfo: true,
//     showSocialLinks: true,
//     showLocation: true,
//     customIntroduction: ''
//   },
//   createdAt: new Date('2024-01-01'),
//   updatedAt: new Date()
// });

// // Add some demo blocks
// mockBlocks.set('block_1', {
//   id: 'block_1',
//   pageId: 'page_1',
//   type: 'LINK',
//   position: 0,
//   isActive: true,
//   title: 'My YouTube Channel',
//   description: 'Latest videos and tutorials',
//   url: 'https://youtube.com/@demouser',
//   imageUrl: null,
//   backgroundColor: '#ff0000',
//   textColor: '#ffffff',
//   borderRadius: 8,
//   data: {},
//   createdAt: new Date()
// });

// mockBlocks.set('block_2', {
//   id: 'block_2',
//   pageId: 'page_1',
//   type: 'PRODUCT',
//   position: 1,
//   isActive: true,
//   title: 'Digital Course',
//   description: 'Learn web development',
//   url: null,
//   imageUrl: null,
//   backgroundColor: '#00ff00',
//   textColor: '#ffffff',
//   borderRadius: 8,
//   data: { price: 49.99 },
//   createdAt: new Date()
// });

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
      logger.info("Creating page with data: userId", userId);
      const title = 'New Page'
      const description = 'New page description'
      const slug = await generateSlug(title);
      logger.info("Creating page with slug:", slug);
      //const pageId = `page_${Date.now()}`;
      const newPage = await prisma.pages.create({ 
        data: {
        userId,
        slug,
        title,
        description,
        isActive: false, // Start as draft
        createdAt: new Date(),
        updatedAt: new Date()
      } });
      if (!newPage) {
        throw new Error('Failed to create page');
      }
      logger.info("New page created:", newPage);

      logger.info("Now creating header for new page");
      const newPageHeader = await prisma.pageHeader.create({
        data: {
          pageId: newPage.id,
          data: {
            logoUrl: null,
            displayName: '',
            bio: '',
            location: '',
            contactEmail: '',
            phoneNumber: null,
            socialLinks: {},
            headerStyle: 'minimal',
            showContactInfo: false,
            showSocialLinks: false,
            showLocation: false,
            customIntroduction: ''
          }
        }
      });
      if (!newPageHeader) {
        throw new Error('Failed to create page header');
      } 
      logger.info("New page header created:", newPageHeader);

      logger.info(`Page created successfully: ${newPage.id}`);
      return {
        ...newPage,
        blocks: [],
        _count: { clicks: 0 }
      };
    } catch (error) {
      logger.error('Error creating page:', error);
      throw new Error('Failed to create page');
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
      throw error;
    }
  }

  static async getUserPages(userId) {
    try {
      const pages = await prisma.pages.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      console.log("Fetched pages for user:", userId, pages);
      return pages;
      // For each page, get block count and click count (mocked here)
      // In real implementation, fetch actual counts from DB
      // Here we just add mock counts
      
      
      
      // Array.from(mockPages.values())
      //   .filter(page => page.userId === userId)
      //   .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // return pages.map(page => ({
      //   ...page,
      //   blocks: { id: true },
      //   _count: { clicks: Math.floor(Math.random() * 1000) }
      // }));
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