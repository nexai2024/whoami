import prisma from '../prisma.js';
import { logger } from '../utils/logger.js';

export class BlockService {
  static async createBlock(pageId, blockData) {
    try {
      const { type, title, description, url, data = {} } = blockData;
      
      // Get the next position
      const lastBlock = await prisma.block.findFirst({
        where: { pageId },
        orderBy: { position: 'desc' }
      });
      
      const position = lastBlock ? lastBlock.position + 1 : 0;
      
      const newBlock = await prisma.block.create({
        data: {
          pageId,
          type,
          title,
          description,
          url,
          position,
          data,
          isActive: true
        },
        include: {
          _count: {
            select: { clicks: true }
          }
        }
      });
      
      logger.info(`Block created successfully: ${newBlock.id}`);
      return newBlock;
    } catch (error) {
      logger.error('Error creating block:', error);
      throw new Error('Failed to create block');
    }
  }

  static async getBlockById(blockId) {
    try {
      const block = await prisma.block.findUnique({
        where: { id: blockId },
        include: {
          _count: {
            select: { clicks: true }
          }
        }
      });
      
      if (!block) {
        throw new Error('Block not found');
      }
      
      return block;
    } catch (error) {
      logger.error(`Error fetching block ${blockId}:`, error);
      throw error;
    }
  }

  static async updateBlock(blockId, updateData) {
    try {
      const block = await prisma.block.update({
        where: { id: blockId },
        data: updateData,
        include: {
          _count: {
            select: { clicks: true }
          }
        }
      });
      
      logger.info(`Block updated successfully: ${blockId}`);
      return block;
    } catch (error) {
      logger.error(`Error updating block ${blockId}:`, error);
      throw error;
    }
  }

  static async deleteBlock(blockId) {
    try {
      await prisma.block.delete({
        where: { id: blockId }
      });
      
      logger.info(`Block deleted successfully: ${blockId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting block ${blockId}:`, error);
      throw error;
    }
  }

  static async reorderBlocks(pageId, blockIds) {
    try {
      const updates = blockIds.map((blockId, index) =>
        prisma.block.update({
          where: { id: blockId },
          data: { position: index }
        })
      );
      
      await prisma.$transaction(updates);
      
      logger.info(`Blocks reordered successfully for page: ${pageId}`);
      return true;
    } catch (error) {
      logger.error(`Error reordering blocks for page ${pageId}:`, error);
      throw error;
    }
  }

  static async getPageBlocks(pageId) {
    try {
      const blocks = await prisma.block.findMany({
        where: { pageId },
        include: {
          _count: {
            select: { clicks: true }
          }
        },
        orderBy: { position: 'asc' }
      });
      
      return blocks;
    } catch (error) {
      logger.error(`Error fetching blocks for page ${pageId}:`, error);
      throw error;
    }
  }

  static async duplicateBlock(blockId) {
    try {
      const originalBlock = await this.getBlockById(blockId);
      
      const duplicatedBlock = await prisma.block.create({
        data: {
          pageId: originalBlock.pageId,
          type: originalBlock.type,
          title: `${originalBlock.title} (Copy)`,
          description: originalBlock.description,
          url: originalBlock.url,
          imageUrl: originalBlock.imageUrl,
          backgroundColor: originalBlock.backgroundColor,
          textColor: originalBlock.textColor,
          borderRadius: originalBlock.borderRadius,
          data: originalBlock.data,
          position: originalBlock.position + 1,
          isActive: originalBlock.isActive
        }
      });
      
      logger.info(`Block duplicated successfully: ${blockId} -> ${duplicatedBlock.id}`);
      return duplicatedBlock;
    } catch (error) {
      logger.error(`Error duplicating block ${blockId}:`, error);
      throw error;
    }
  }
}