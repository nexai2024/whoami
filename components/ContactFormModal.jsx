import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiCheck, FiUser, FiPhone, FiMessageSquare } from 'react-icons/fi';

const ContactFormModal = ({ block, pageId, onClose }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Initialize form fields from block data
  useEffect(() => {
    const fields = block.data?.fields || [];
    const initialData = {};
    fields.forEach(field => {
      initialData[field.name || field.key] = '';
    });
    setFormData(initialData);
  }, [block]);

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

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setError(''); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError('');

    // Validate required fields
    const fields = block.data?.fields || [];
    const requiredFields = fields.filter(f => f.required);
    
    for (const field of requiredFields) {
      const fieldName = field.name || field.key;
      if (!formData[fieldName] || formData[fieldName].trim() === '') {
        setError(`${field.label || fieldName} is required`);
        return;
      }
    }

    // Validate email if present
    if (formData.email && !validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          blockId: block.id,
          formData,
          notificationEmail: block.data?.notificationEmail,
          sendAutoReply: block.data?.sendAutoReply,
          autoReplyMessage: block.data?.autoReplyMessage
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(data.error || 'Failed to submit form. Please try again.');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldIcon = (type) => {
    const iconMap = {
      email: FiMail,
      name: FiUser,
      phone: FiPhone,
      message: FiMessageSquare,
      text: FiMessageSquare
    };
    return iconMap[type] || FiMessageSquare;
  };

  const fields = block.data?.fields || [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'message', label: 'Message', type: 'textarea', required: true }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-6 h-6" />
          </button>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-600">{block.data?.successMessage || 'Thank you for your message. We\'ll get back to you soon.'}</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {block.title || 'Contact Us'}
                </h3>
                {block.description && (
                  <p className="text-sm text-gray-600">{block.description}</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map((field, idx) => {
                  const fieldName = field.name || field.key;
                  const FieldIcon = getFieldIcon(field.type);
                  const isRequired = field.required !== false;

                  if (field.type === 'textarea') {
                    return (
                      <div key={idx}>
                        <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label || fieldName} {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                          id={fieldName}
                          value={formData[fieldName] || ''}
                          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label || fieldName}`}
                          rows={field.rows || 4}
                          required={isRequired}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={idx}>
                      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label || fieldName} {isRequired && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FieldIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id={fieldName}
                          type={field.type || 'text'}
                          value={formData[fieldName] || ''}
                          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label || fieldName}`}
                          required={isRequired}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : (block.data?.submitButtonText || 'Send Message')}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContactFormModal;

