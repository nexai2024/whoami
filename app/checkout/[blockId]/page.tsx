'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/CheckoutForm';
import { logger } from '@/lib/utils/logger';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const blockId = params.blockId as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProductDetails();
  }, [blockId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);

      // Fetch block/product details
      const response = await fetch(`/api/blocks/${blockId}`);

      if (!response.ok) {
        throw new Error('Product not found');
      }

      const blockData = await response.json();

      // Extract product info
      const productInfo = {
        id: blockData.id,
        title: blockData.product?.name || blockData.title,
        price: blockData.product?.price || blockData.data?.price || 0,
        description: blockData.product?.description || blockData.description,
      };

      setProduct(productInfo);
    } catch (err) {
      logger.error('Error loading product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The product you\'re looking for doesn\'t exist.'}
          </p>
          <button
            onClick={() => window.close()}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Product Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h1>
          {product.description && (
            <p className="text-gray-600 mb-4">{product.description}</p>
          )}
          <div className="text-3xl font-bold text-indigo-600">
            ${product.price.toFixed(2)}
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Complete Your Purchase</h2>

          <Elements
            stripe={stripePromise}
            options={{
              mode: 'payment',
              currency: 'usd',
              amount: Math.round(product.price * 100),
            }}
          >
            <CheckoutForm blockId={blockId} productTitle={product.title} />
          </Elements>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secured by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
