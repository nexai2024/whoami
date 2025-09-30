import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { SignIn } from '@clerk/react-router'

const { FiUser, FiLock, FiArrowRight } = FiIcons;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Left Section - Branding */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 flex-col justify-center items-center text-white relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`
          }} />
        </div>
        
        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              WhoAmI
            </h1>
            <h2 className="text-3xl font-semibold mb-6">Welcome Back!</h2>
            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              Transform your digital presence into an intelligent hub for content, community, and commerce.
            </p>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiUser} className="text-sm" />
                </div>
                <span>Advanced Analytics & AI Insights</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiLock} className="text-sm" />
                </div>
                <span>Secure & Professional Platform</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiArrowRight} className="text-sm" />
                </div>
                <span>Multiple Revenue Streams</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Section - Authentication */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              WhoAmI
            </h1>
            <p className="text-gray-600 mt-2">Welcome back to your digital hub</p>
          </div>

          {/* Login Form */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border p-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Continue to your account</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Signing you in...</span>
              </div>
            ) : (
             <SignIn />
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <span className="text-indigo-600 font-medium cursor-pointer hover:text-indigo-700">
                  Sign up here
                </span>
              </p>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <p className="text-xs text-gray-500 mb-4">
              Trusted by 10,000+ creators worldwide
            </p>
            <div className="flex justify-center gap-6 opacity-60">
              <div className="text-xs text-gray-400">🔒 SSL Secured</div>
              <div className="text-xs text-gray-400">⚡ Fast & Reliable</div>
              <div className="text-xs text-gray-400">🛡️ Privacy Protected</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;