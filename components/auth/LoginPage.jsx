import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { QuestLogin } from '@questlabs/react-sdk';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import questConfig from '../../config/questConfig';
import { QuestAuthService, getBrowserId } from '../../lib/auth/questAuth';
import { logger } from '../../lib/utils/logger';
import { SignIn } from '@clerk/clerk-react';

const { FiUser, FiLock, FiArrowRight, FiShield, FiZap, FiUsers } = FiIcons;

const LoginPage = () => {


  const features = [
    {
      icon: FiZap,
      title: "Lightning Fast Setup",
      description: "Get your link-in-bio page live in minutes"
    },
    {
      icon: FiUsers,
      title: "Audience Insights",
      description: "Deep analytics to understand your visitors"
    },
    {
      icon: FiShield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your data"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Section - Branding */}
        <motion.div 
          className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-white"></div>
          </div>
          
          <div className="relative z-10 text-center max-w-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                WhoAmI
              </h1>
              <h2 className="text-2xl font-semibold mb-4">
                Welcome Back!
              </h2>
              <p className="text-lg opacity-90 mb-8">
                Your ultimate link-in-bio platform for creators, entrepreneurs, and professionals.
              </p>
            </motion.div>

            <motion.div
              className="space-y-6"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 text-left"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                >
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                    <SafeIcon name={undefined}  icon={feature.icon} className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm opacity-80">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section - Login Form */}
        <motion.div 
          className="flex flex-col justify-center items-center p-8 lg:p-12"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                WhoAmI
              </h1>
              <p className="text-gray-600 mt-2">Welcome back to your dashboard</p>
            </div>

            {/* Login Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <SafeIcon name={undefined}  icon={FiUser} className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sign In to Your Account
              </h2>
              <p className="text-gray-600">
                Continue building your digital presence
              </p>
            </motion.div>

            {/* Quest Login Component */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl border p-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{
                '--quest-primary-color': questConfig.PRIMARY_COLOR,
                '--quest-secondary-color': questConfig.SECONDARY_COLOR
              }}
            >
             <SignIn signUpFallbackRedirectUrl="/dashboard" />
            </motion.div>

            {/* Additional Info */}
            <motion.div
              className="text-center mt-8 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <SafeIcon name={undefined}  icon={FiShield} />
                <span>Your data is secure and encrypted</span>
              </div>
              
              <div className="text-sm text-gray-600">
                New to WhoAmI?{' '}
                <button 
                  onClick={() => navigate('/pricing')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Learn more about our plans
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;