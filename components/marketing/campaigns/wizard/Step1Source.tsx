'use client';

/**
 * Campaign Wizard - Step 1: Source Selection
 * Select what to promote (product, block, or custom input)
 */

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';

interface FormData {
  name: string;
  sourceType: 'PRODUCT' | 'BLOCK' | 'CUSTOM';
  sourceId?: string;
  sourceText?: string;
}

interface Step1SourceProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

interface Product {
  id: string;
  name: string;
}

interface Block {
  id: string;
  type: string;
  data: any;
}

export default function Step1Source({ formData, updateFormData }: Step1SourceProps) {
  const user = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setProducts([]);
      setBlocks([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    if (formData.sourceType === 'PRODUCT') {
      fetchProducts();
    } else if (formData.sourceType === 'BLOCK') {
      fetchBlocks();
    }
  }, [formData.sourceType, user?.id]);

  const fetchProducts = async () => {
    if (!user?.id) return;
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products', {
        headers: { 'x-user-id': user.id },
      });
      if (!response.ok) {
        throw new Error(`Failed to load products: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchBlocks = async () => {
    if (!user?.id) return;
    setLoadingBlocks(true);
    try {
      const response = await fetch('/api/blocks', {
        headers: { 'x-user-id': user.id },
      });
      if (!response.ok) {
        throw new Error(`Failed to load blocks: ${response.status}`);
      }
      const data = await response.json();
      setBlocks(data.blocks || []);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoadingBlocks(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Campaign Source
        </h2>
        <p className="text-gray-600">
          What would you like to promote in this campaign?
        </p>
      </div>

      {/* Campaign Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="e.g., Q1 Product Launch, Summer Sale 2024"
          maxLength={100}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.name.length}/100 characters
        </p>
      </div>

      {/* Source Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Source Type *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Existing Product */}
          <button
            type="button"
            onClick={() => updateFormData({ sourceType: 'PRODUCT', sourceId: undefined, sourceText: undefined })}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              formData.sourceType === 'PRODUCT'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">📦</div>
            <h3 className="font-semibold text-gray-900 mb-1">Existing Product</h3>
            <p className="text-sm text-gray-600">
              Generate campaign from one of your products
            </p>
          </button>

          {/* Content Block */}
          <button
            type="button"
            onClick={() => updateFormData({ sourceType: 'BLOCK', sourceId: undefined, sourceText: undefined })}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              formData.sourceType === 'BLOCK'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">🧩</div>
            <h3 className="font-semibold text-gray-900 mb-1">Content Block</h3>
            <p className="text-sm text-gray-600">
              Create campaign from a page block or section
            </p>
          </button>

          {/* Custom Input */}
          <button
            type="button"
            onClick={() => updateFormData({ sourceType: 'CUSTOM', sourceId: undefined, sourceText: undefined })}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              formData.sourceType === 'CUSTOM'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">✏️</div>
            <h3 className="font-semibold text-gray-900 mb-1">Custom Input</h3>
            <p className="text-sm text-gray-600">
              Describe what you want to promote from scratch
            </p>
          </button>
        </div>
      </div>

      {/* Conditional Fields Based on Source Type */}
      {formData.sourceType === 'PRODUCT' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Product *
          </label>
          {loadingProducts ? (
            <div className="text-gray-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              No products found. Please create a product first.
            </div>
          ) : (
            <select
              value={formData.sourceId || ''}
              onChange={(e) => updateFormData({ sourceId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {formData.sourceType === 'BLOCK' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Block *
          </label>
          {loadingBlocks ? (
            <div className="text-gray-500">Loading blocks...</div>
          ) : blocks.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              No blocks found. Please create a content block first.
            </div>
          ) : (
            <select
              value={formData.sourceId || ''}
              onChange={(e) => updateFormData({ sourceId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a block...</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.type} - {block.data?.title || block.data?.text?.substring(0, 50) || 'Untitled'}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {formData.sourceType === 'CUSTOM' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe What You Want to Promote *
          </label>
          <textarea
            value={formData.sourceText || ''}
            onChange={(e) => updateFormData({ sourceText: e.target.value })}
            placeholder="Describe your product, service, event, or offer in detail. Include key features, benefits, and what makes it special..."
            maxLength={500}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.sourceText || '').length}/500 characters
          </p>
        </div>
      )}
    </div>
  );
}
