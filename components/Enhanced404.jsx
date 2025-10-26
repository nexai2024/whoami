import React from 'react';
import { Link } from 'next/link';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHome, FiArrowLeft, FiSearch } = FiIcons;

const Enhanced404 = ({ type = 'page' }) => {
  const messages = {
    page: {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist or has been moved.",
      suggestion: "Check the URL or go back to the homepage."
    },
    user: {
      title: "User Not Found", 
      description: "This user profile doesn't exist or is no longer available.",
      suggestion: "Try searching for a different username."
    },
    general: {
      title: "404 - Not Found",
      description: "Sorry, we can't find what you're looking for.",
      suggestion: "Let's get you back on track."
    }
  };

  const message = messages[type] || messages.general;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-indigo-200 mb-4">404</div>
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <SafeIcon name={undefined}  icon={FiSearch} className="text-white text-4xl" />
            </div>
          </div>

          {/* Error Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {message.title}
            </h1>
            <p className="text-gray-600 mb-2">
              {message.description}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              {message.suggestion}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <SafeIcon name={undefined}  icon={FiHome} />
              Go to Homepage
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <SafeIcon name={undefined}  icon={FiArrowLeft} />
              Go Back
            </button>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 text-sm text-gray-500"
          >
            Need help? <Link to="/help" className="text-indigo-600 hover:text-indigo-700 underline">Contact Support</Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Enhanced404;