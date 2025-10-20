import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiCheck } from 'react-icons/fi';

const EmailCaptureModal = ({ block, pageId, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Email validation regex
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Focus email input on mount
  useEffect(() => {
    const input = document.getElementById('email-input');
    if (input) {
      input.focus();
    }
  }, []);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError('');

    // Trim whitespace
    const trimmedEmail = email.trim();

    // Validate email
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Submit to API
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/email-subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          pageId: pageId,
          blockId: block.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success state
        setSuccess(true);

        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        // Handle specific error cases
        if (data.message === 'Already subscribed') {
          setSuccess(true);
          setTimeout(() => {
            onClose();
          }, 3000);
        } else {
          setError(data.error || 'Oops! Something went wrong. Please try again.');
        }
      }
    } catch (err) {
      console.error('Email subscription error:', err);
      setError('Oops! Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get modal content based on block data
  const title = block.data?.title || block.title || 'Stay Connected';
  const description = block.data?.description || block.description ||
    'Subscribe to get notified about new content, updates, and special offers.';

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <FiX className="text-xl" />
          </button>

          {/* Content */}
          <div className="p-8">
            {success ? (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="text-3xl text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Thanks for subscribing!
                </h3>
                <p className="text-gray-600">
                  Check your email to confirm your subscription.
                </p>
              </div>
            ) : (
              /* Form State */
              <>
                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMail className="text-2xl text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                  {title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-center mb-6">
                  {description}
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(''); // Clear error on typing
                      }}
                      placeholder="Enter your email"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        error
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-purple-500'
                      }`}
                      disabled={isSubmitting}
                    />

                    {/* Error Message */}
                    {error && (
                      <p className="text-red-500 text-sm mt-2">
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      isSubmitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 hover:shadow-lg'
                    }`}
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
                  </button>

                  {/* Privacy Note */}
                  <p className="text-xs text-gray-500 text-center">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailCaptureModal;
