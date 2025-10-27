import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'next/link';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiZap, FiTrendingUp, FiUsers, FiDollarSign, FiBarChart3, FiShoppingBag, FiTarget, FiStar, FiArrowRight, FiCheck } = FiIcons;

const LandingPage = () => {
  const features = [
    {
      icon: FiZap,
      title: "AI-Powered Page Builder",
      description: "Drag-and-drop interface with intelligent suggestions and real-time optimization"
    },
    {
      icon: FiShoppingBag,
      title: "Native E-commerce Engine",
      description: "Sell digital products, accept tips, and manage bookings directly from your page"
    },
    {
      icon: FiUsers,
      title: "Community Building Tools",
      description: "AMA blocks, gated content, and push notifications to engage your audience"
    },
    {
      icon: FiBarChart3,
      title: "Advanced Analytics & AI",
      description: "Deep insights with A/B testing and AI-powered optimization recommendations"
    },
    {
      icon: FiTarget,
      title: "Smart Link Management",
      description: "Dynamic links with scheduling, archiving, and automatic RSS integration"
    },
    {
      icon: FiDollarSign,
      title: "Multiple Revenue Streams",
      description: "Digital products, services, affiliate links, and subscription-based content"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      quote: "WhoAmI transformed my link-in-bio from a simple list to a revenue-generating storefront. I've tripled my digital product sales!"
    },
    {
      name: "Marcus Johnson",
      role: "YouTuber",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      quote: "The analytics are incredible. I finally understand my audience and can optimize my content strategy based on real data."
    },
    {
      name: "Elena Rodriguez",
      role: "Artist & Designer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      quote: "The portfolio blocks and custom theming let me showcase my work beautifully. It's like having a personal website that's actually engaging."
    }
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              WhoAmI
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              The ultimate link-in-bio platform that transforms your digital presence into an intelligent hub for content, community, and commerce.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link
                to="/handler/sign-in"
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Get Started Free
                <SafeIcon name={undefined}  icon={FiArrowRight} />
              </Link>
              <Link
                to="/pricing"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
              >
                View Pricing
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Beyond Simple Link Sharing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              WhoAmI redefines what a link-in-bio can be. Create an intelligent, revenue-generating digital presence that grows with your brand.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <SafeIcon name={undefined}  icon={feature.icon} className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Vision Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Vision & Mission</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold text-indigo-600 mb-3">Vision</h3>
                  <p className="text-gray-700">To be the central, intelligent platform where creators and brands manage their digital identity, engage their audience, and build their business.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold text-purple-600 mb-3">Mission</h3>
                  <p className="text-gray-700">To empower users by providing powerful tools for customization, monetization, and analytics that go far beyond simple link sharing.</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Target Audiences</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <SafeIcon name={undefined}  icon={FiStar} className="text-yellow-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Primary: Content Creators</h4>
                    <p className="text-sm text-gray-600">Full-time influencers, YouTubers needing monetization and audience insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <SafeIcon name={undefined}  icon={FiTrendingUp} className="text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Secondary: Small Businesses</h4>
                    <p className="text-sm text-gray-600">E-commerce brands, artists, musicians, coaches seeking direct sales</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <SafeIcon name={undefined}  icon={FiUsers} className="text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Tertiary: Personal Users</h4>
                    <p className="text-sm text-gray-600">Individuals wanting consolidated online presence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Creators Worldwide</h2>
            <p className="text-xl text-gray-600">See how WhoAmI is transforming digital presence for creators and businesses</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Digital Presence?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Join thousands of creators who've already elevated their link-in-bio game with WhoAmI
          </p>
          <Link
            to="/handler/sign-in"
            className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-50 transition-all duration-300 inline-flex items-center gap-2"
          >
            Start Your Free Trial
            <SafeIcon name={undefined}  icon={FiArrowRight} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;