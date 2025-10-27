import React, { useState, useEffect } from 'react';
import { redirect } from 'react-router';
import { motion } from 'framer-motion';
import { OnBoarding } from '@questlabs/react-sdk';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import questConfig from '../../config/questConfig';
import { QuestAuthService } from '../../lib/auth/questAuth';
import { logger } from '../../lib/utils/logger';

const { FiUser, FiTarget, FiZap, FiArrowRight, FiCheckCircle, FiStar } = FiIcons;

const OnboardingPage = () => {
  //const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  
  const { userId, token } = QuestAuthService.getStoredAuth();

  useEffect(() => {
    // Redirect if not authenticated or not a new user
    if (!QuestAuthService.isAuthenticated()) {
      redirect('/handler/sign-in');
      return;
    }

    const isNewUser = localStorage.getItem('isNewUser') === 'true';
    if (!isNewUser) {
      redirect('/dashboard');
    }
  }, [redirect]);

  const handleOnboardingComplete = () => {
    try {
      // Mark onboarding as completed
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.removeItem('isNewUser');
      
      logger.info('Onboarding completed successfully');
      
      // redirect to dashboard
      redirect('/dashboard');
    } catch (error) {
      logger.error('Error completing onboarding:', error);
      redirect('/dashboard'); // Fallback navigation
    }
  };

  const benefits = [
    {
      icon: FiTarget,
      title: "Personalized Experience",
      description: "Get customized recommendations based on your goals"
    },
    {
      icon: FiZap,
      title: "Quick Setup",
      description: "We'll help you get your first page live in minutes"
    },
    {
      icon: FiStar,
      title: "Best Practices",
      description: "Learn proven strategies from successful creators"
    }
  ];

  const steps = [
    { number: 1, title: "Tell us about yourself", description: "Basic information and goals" },
    { number: 2, title: "Choose your preferences", description: "Customize your experience" },
    { number: 3, title: "Setup your first page", description: "Get started with templates" }
  ];

  if (!userId || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your onboarding experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Section - Progress & Motivation */}
        <motion.div 
          className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 text-white relative overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-white"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-white"></div>
            <div className="absolute top-1/3 left-1/3 w-20 h-20 rounded-full bg-white"></div>
          </div>

          <div className="relative z-10 text-center max-w-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <SafeIcon name={undefined}  icon={FiZap} className="text-3xl" />
              </div>
              
              <h1 className="text-3xl font-bold mb-4">
                Let's Get You Started!
              </h1>
              <p className="text-lg opacity-90 mb-8">
                We're setting up your perfect digital workspace. This will only take a few minutes.
              </p>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
              className="space-y-4 mb-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  className={`flex items-center gap-4 text-left p-3 rounded-lg transition-all ${
                    currentStep >= step.number 
                      ? 'bg-white bg-opacity-20 backdrop-blur-sm' 
                      : 'opacity-60'
                  }`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep > step.number 
                      ? 'bg-green-400 text-green-900' 
                      : currentStep === step.number
                      ? 'bg-white text-purple-600'
                      : 'bg-white bg-opacity-30 text-white'
                  }`}>
                    {currentStep > step.number ? (
                      <SafeIcon name={undefined}  icon={FiCheckCircle} />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm opacity-80">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Benefits */}
            <motion.div
              className="space-y-3"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <h3 className="text-lg font-semibold mb-4">What you'll get:</h3>
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 text-left"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
                >
                  <SafeIcon name={undefined}  icon={benefit.icon} className="text-lg mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">{benefit.title}</h4>
                    <p className="text-xs opacity-80">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section - Onboarding Component */}
        <motion.div 
          className="flex flex-col justify-center items-center p-8 lg:p-12"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome to WhoAmI!
              </h1>
              <p className="text-gray-600">Let's set up your account</p>
            </div>

            {/* Onboarding Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <SafeIcon name={undefined}  icon={FiUser} className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Your Setup
              </h2>
              <p className="text-gray-600">
                Help us personalize your WhoAmI experience
              </p>
            </motion.div>

            {/* Quest Onboarding Component */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl border overflow-hidden"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{
                '--quest-primary-color': questConfig.PRIMARY_COLOR,
                '--quest-secondary-color': questConfig.SECONDARY_COLOR,
                minHeight: '400px'
              }}
            >
              <OnBoarding
                userId={userId}
                token={token}
                questId={questConfig.QUEST_ONBOARDING_QUESTID}
                answer={answers}
                setAnswer={setAnswers}
                getAnswers={handleOnboardingComplete}
                singleChoose="modal1"
                multiChoice="modal2"
                primaryColor={questConfig.PRIMARY_COLOR}
                secondaryColor={questConfig.SECONDARY_COLOR}
              >
                <OnBoarding.Header />
                <OnBoarding.Content />
                <OnBoarding.Footer />
              </OnBoarding>
            </motion.div>

            {/* Skip Option */}
            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <button
                onClick={handleOnboardingComplete}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Skip for now and go to dashboard
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPage;