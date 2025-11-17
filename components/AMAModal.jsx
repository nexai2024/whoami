import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiCheck, FiMessageSquare } from 'react-icons/fi';

const AMAModal = ({ block, pageId, ownerId, onClose }) => {
  const [step, setStep] = useState(1); // 1 = email, 2 = question
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
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

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Focus input on step change
  useEffect(() => {
    if (step === 1) {
      const input = document.getElementById('ama-email-input');
      if (input) input.focus();
    } else if (step === 2) {
      const input = document.getElementById('ama-question-input');
      if (input) input.focus();
    }
  }, [step]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    setError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Save email and move to question step
    setStep(2);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();

    setError('');

    const trimmedQuestion = question.trim();
    const maxLength = block.data?.maxQuestionLength || 1000;

    if (!trimmedQuestion) {
      setError('Please enter your question');
      return;
    }

    if (trimmedQuestion.length < 10) {
      setError('Question must be at least 10 characters');
      return;
    }

    if (trimmedQuestion.length > maxLength) {
      setError(`Question must be no more than ${maxLength} characters`);
      return;
    }

    setIsSubmitting(true);

    try {
      // First, capture email if not already done
      if (email && ownerId) {
        try {
          await fetch('/api/email-subscribers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email.trim(),
              pageId: pageId,
              blockId: block.id,
              pageType: 'PAGE',
              userId: ownerId,
              name: name || undefined,
            }),
          });
        } catch (emailError) {
          // Don't fail if email capture fails
          console.error('Email capture error:', emailError);
        }
      }

      // Submit the question
      const response = await fetch('/api/ama/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          blockId: block.id,
          email: email.trim(),
          name: name || undefined,
          question: trimmedQuestion,
          requireApproval: block.data?.requireApproval !== false,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(data.error || 'Failed to submit question. Please try again.');
      }
    } catch (err) {
      console.error('AMA question submission error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = block.data?.questionFormTitle || block.title || 'Ask Me Anything';
  const introMessage = block.data?.introMessage || 'What would you like to know?';
  const questionPlaceholder = block.data?.questionPlaceholder || 'Your question...';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Question Submitted!</h3>
              <p className="text-gray-600">
                {block.data?.requireApproval !== false
                  ? 'Your question has been submitted and is pending approval. We\'ll notify you when it\'s answered!'
                  : 'Thank you for your question! We\'ll get back to you soon.'}
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {step === 1 ? (
                    <FiMail className="w-8 h-8 text-purple-600" />
                  ) : (
                    <FiMessageSquare className="w-8 h-8 text-purple-600" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                {step === 1 && (
                  <p className="text-sm text-gray-600">
                    First, let's get your contact information
                  </p>
                )}
                {step === 2 && (
                  <div 
                    className="text-sm text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: introMessage }}
                  />
                )}
              </div>

              {step === 1 ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="ama-email-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="ama-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="ama-name-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Name (optional)
                    </label>
                    <input
                      id="ama-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

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
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleQuestionSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="ama-question-input" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="ama-question-input"
                      value={question}
                      onChange={(e) => {
                        setQuestion(e.target.value);
                        setError('');
                      }}
                      placeholder={questionPlaceholder}
                      rows={5}
                      required
                      maxLength={block.data?.maxQuestionLength || 1000}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {question.length} / {block.data?.maxQuestionLength || 1000} characters
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Question'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AMAModal;

