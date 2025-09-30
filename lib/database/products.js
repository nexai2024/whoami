import { logger } from '../utils/logger.js';

export class ProductService {
  static async createProduct(userId, productData) {
    try {
      const { name, description, price, currency = 'USD', fileUrl } = productData;
      
      const product = {
        id: `product_${Date.now()}`,
        userId,
        name,
        description,
        price,
        currency,
        fileUrl,
        isActive: true,
        createdAt: new Date()
      };

      logger.info(`Product created successfully: ${product.id}`);
      return product;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  static async getProductById(productId) {
    try {
      // Simulate product data
      const mockProduct = {
        id: productId,
        name: 'Digital Art Course',
        description: 'Complete guide to digital art',
        price: 49.99,
        currency: 'USD',
        fileUrl: 'https://example.com/course.zip',
        isActive: true,
        _count: { sales: 25 }
      };

      return mockProduct;
    } catch (error) {
      logger.error(`Error fetching product ${productId}:`, error);
      throw new Error('Product not found');
    }
  }

  static async updateProduct(productId, updateData) {
    try {
      logger.info(`Product updated successfully: ${productId}`);
      return { id: productId, ...updateData };
    } catch (error) {
      logger.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  }

  static async deleteProduct(productId) {
    try {
      logger.info(`Product deleted successfully: ${productId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting product ${productId}:`, error);
      throw error;
    }
  }

  static async getUserProducts(userId) {
    try {
      // Simulate user products
      const mockProducts = [
        {
          id: 'product_1',
          name: 'Digital Art Course',
          description: 'Complete digital art tutorial',
          price: 49.99,
          currency: 'USD',
          isActive: true,
          _count: { sales: 25 }
        },
        {
          id: 'product_2',
          name: 'Lightroom Presets Pack',
          description: '50 professional presets',
          price: 19.99,
          currency: 'USD',
          isActive: true,
          _count: { sales: 67 }
        }
      ];

      return mockProducts;
    } catch (error) {
      logger.error(`Error fetching products for user ${userId}:`, error);
      throw error;
    }
  }

  static async recordSale(saleData) {
    try {
      const { productId, buyerEmail, amount, currency = 'USD', stripePaymentIntentId } = saleData;
      
      const sale = {
        id: `sale_${Date.now()}`,
        productId,
        buyerEmail,
        amount,
        currency,
        stripePaymentIntentId,
        status: 'completed',
        createdAt: new Date()
      };

      logger.info(`Sale recorded successfully: ${sale.id}`);
      return sale;
    } catch (error) {
      logger.error('Error recording sale:', error);
      throw error;
    }
  }

  static async getProductSales(productId) {
    try {
      // Simulate product sales
      const mockSales = [
        {
          id: 'sale_1',
          productId,
          buyerEmail: 'customer@example.com',
          amount: 49.99,
          currency: 'USD',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000) // 1 day ago
        }
      ];

      return mockSales;
    } catch (error) {
      logger.error(`Error fetching sales for product ${productId}:`, error);
      throw error;
    }
  }
}