import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCheck, FiStar, FiZap, FiTrendingUp, FiUsers } = FiIcons;

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      icon: FiUsers,
      color: "from-gray-500 to-gray-600",
      features: [
        "Basic link-in-bio page",
        "Up to 5 links",
        "Basic customization",
        "WhoAmI branding",
        "Basic analytics",
        "Community support"
      ],
      limitations: [
        "Limited to 3 page blocks",
        "No custom domain",
        "Standard templates only"
      ]
    },
    {
      name: "Creator",
      price: "$10",
      period: "month",
      description: "For content creators ready to grow",
      icon: FiStar,
      color: "from-blue-500 to-indigo-600",
      popular: true,
      features: [
        "Everything in Free",
        "Unlimited links & blocks",
        "Custom domain connection",
        "Remove WhoAmI branding",
        "Advanced analytics",
        "Tipping & donations",
        "Email capture forms",
        "Priority email support",
        "Custom themes & fonts"
      ]
    },
    {
      name: "Pro",
      price: "$25",
      period: "month",
      description: "For professionals maximizing revenue",
      icon: FiZap,
      color: "from-purple-500 to-pink-600",
      features: [
        "Everything in Creator",
        "Digital product sales",
        "Gated content blocks",
        "A/B testing tools",
        "AI link optimizer",
        "Advanced integrations",
        "Service booking system",
        "Revenue analytics",
        "Push notifications",
        "AMA blocks"
      ]
    },
    {
      name: "Business",
      price: "$50",
      period: "month",
      description: "For teams and agencies",
      icon: FiTrendingUp,
      color: "from-indigo-600 to-purple-700",
      features: [
        "Everything in Pro",
        "Team member access (5 users)",
        "Multiple pages per account",
        "White-label options",
        "Advanced e-commerce",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Priority phone support",
        "Advanced security features"
      ]
    }
  ];

  const comparison = [
    {
      category: "Page Builder & Customization",
      features: [
        { name: "Drag-and-drop interface", free: true, creator: true, pro: true, business: true },
        { name: "Custom domains", free: false, creator: true, pro: true, business: true },
        { name: "Remove branding", free: false, creator: true, pro: true, business: true },
        { name: "Advanced theming", free: false, creator: true, pro: true, business: true },
        { name: "White-labeling", free: false, creator: false, pro: false, business: true }
      ]
    },
    {
      category: "E-commerce & Monetization",
      features: [
        { name: "Tipping & donations", free: false, creator: true, pro: true, business: true },
        { name: "Digital product sales", free: false, creator: false, pro: true, business: true },
        { name: "Service booking", free: false, creator: false, pro: true, business: true },
        { name: "Advanced e-commerce", free: false, creator: false, pro: false, business: true }
      ]
    },
    {
      category: "Analytics & AI",
      features: [
        { name: "Basic analytics", free: true, creator: true, pro: true, business: true },
        { name: "Advanced analytics", free: false, creator: true, pro: true, business: true },
        { name: "A/B testing", free: false, creator: false, pro: true, business: true },
        { name: "AI optimization", free: false, creator: false, pro: true, business: true }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            className="text-5xl font-bold text-gray-900 mb-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Choose the plan that fits your needs. Upgrade or downgrade at any time with no long-term commitments.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-4 gap-8 mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                <div className={`bg-gradient-to-r ${plan.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6`}>
                  <SafeIcon name={undefined}  icon={plan.icon} className="text-white text-xl" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                
                <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  {plan.name === 'Free' ? 'Get Started' : 'Start Free Trial'}
                </button>
                
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 mb-4">What's included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <SafeIcon name={undefined}  icon={FiCheck} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations && (
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-700 mb-2">Limitations:</h5>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="text-sm text-gray-500">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Feature Comparison</h2>
            
            {comparison.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {category.category}
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-sm text-gray-600">
                        <th className="text-left py-2 w-1/2">Feature</th>
                        <th className="text-center py-2">Free</th>
                        <th className="text-center py-2">Creator</th>
                        <th className="text-center py-2">Pro</th>
                        <th className="text-center py-2">Business</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.features.map((feature, featureIndex) => (
                        <tr key={featureIndex} className="border-t border-gray-100">
                          <td className="py-3 text-gray-700">{feature.name}</td>
                          <td className="text-center py-3">
                            {feature.free ? (
                              <SafeIcon name={undefined}  icon={FiCheck} className="text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="text-center py-3">
                            {feature.creator ? (
                              <SafeIcon name={undefined}  icon={FiCheck} className="text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="text-center py-3">
                            {feature.pro ? (
                              <SafeIcon name={undefined}  icon={FiCheck} className="text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="text-center py-3">
                            {feature.business ? (
                              <SafeIcon name={undefined}  icon={FiCheck} className="text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans at any time?</h3>
              <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-left">
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for annual plans. All payments are processed securely through Stripe.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial for paid plans?</h3>
              <p className="text-gray-600">Yes! All paid plans come with a 14-day free trial. No credit card required to start your trial.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;