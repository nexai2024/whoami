import React, { useState, useEffect } from 'react';
import { redirect } from 'react-router';
import { motion } from 'framer-motion';
import { OnBoarding } from '@questlabs/react-sdk';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTarget, FiUsers, FiTrendingUp, FiCheck, FiArrowRight } = FiIcons;

const OnboardingPage = () => {
  //const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check authentication
    const storedUserId = localStorage.getItem('userId');
    const storedToken = localStorage.getItem('token');
    const isAuthenticated = localStorage.getItem('isAuthenticated');

    if (!storedUserId || !storedToken || !isAuthenticated) {
      redirect('/login');
      return;
    }

    setUserId(storedUserId);
    setToken(storedToken);
  }, [redirect]);

  const getAnswers = () => {
    // Mark onboarding as complete
    localStorage.setItem('onboardingComplete', 'true');
    
    // redirect to main dashboard
    redirect('/dashboard');
  };

  if (!userId || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Left Section - Visual/Branding */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 p-12 flex-col justify-center items-center text-white relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)`
          }} />
        </div>
        
        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiTarget} className="text-3xl" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">Let's Get Started!</h1>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              We're setting up your personalized WhoAmI experience. This will only take a few minutes.
            </p>
            
            <div className="space-y-6">
              <motion.div 
                className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiUsers} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Understand Your Audience</h3>
                  <p className="text-sm text-green-100">Tell us about your goals and target audience</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiTrendingUp} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Optimize Your Setup</h3>
                  <p className="text-sm text-green-100">Get personalized recommendations</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiCheck} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Start Building</h3>
                  <p className="text-sm text-green-100">Launch your optimized page</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Section - Onboarding Component */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiTarget} className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Let's Get Started!</h1>
            <p className="text-gray-600">Setting up your personalized experience</p>
          </div>

          {/* Onboarding Container */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border overflow-hidden"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ minHeight: '400px' }}
          >
            <OnBoarding
              userId={userId}
              token={token}
              questId="c-greta-onboarding"
              answer={answers}
              setAnswer={setAnswers}
              getAnswers={getAnswers}
              singleChoose="modal1"
              multiChoice="modal2"
            >
              <OnBoarding.Header />
              <OnBoarding.Content />
              <OnBoarding.Footer />
            </OnBoarding>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <p className="text-sm text-gray-500 mb-3">
              Step {currentStep} of 3 - Personalizing your experience
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    step <= currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Help Text */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p className="text-xs text-gray-500">
              Need help? Contact our support team anytime
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;