'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Icon Components
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  isActive: boolean;
  planEnum?: string; // FREE, CREATOR, PRO, BUSINESS, SUPER_ADMIN
  description?: string;
  features: Array<{
    feature: {
      name: string;
      displayName: string;
    };
    limit: number | null;
  }>;
}

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  stripeSubscriptionId?: string;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: Array<{
      feature: {
        name: string;
        displayName: string;
      };
      limit: number | null;
    }>;
  };
}

// Feature descriptions for tooltips
const featureDescriptions: Record<string, string> = {
  'pages': 'Create and manage link-in-bio pages and landing pages',
  'lead_magnets': 'Create downloadable lead magnets to grow your email list',
  'funnels': 'Build conversion funnels to guide visitors through your sales process',
  'campaigns': 'Create and manage marketing campaigns across multiple channels',
  'micro_courses': 'Create and sell short-form educational courses',
  'storage_gb': 'File storage space for your content and assets',
  'custom_domains': 'Connect your own domain name to your pages',
  'subdomains': 'Use custom subdomains for your pages',
  'analytics': 'Track performance metrics and visitor analytics',
  'remove_branding': 'Remove WhoAmI branding from your pages',
  'email_capture': 'Collect email addresses with customizable forms',
  'digital_products': 'Sell digital products and downloads',
  'gated_content': 'Create content that requires email signup or purchase to access',
  'ab_testing': 'Test different versions of your pages to optimize conversions',
  'api_access': 'Access to our API for custom integrations',
  'team_members': 'Add team members to collaborate on your account',
  'priority_support': 'Get priority customer support with faster response times',
  'white_label': 'Fully white-label the platform with your own branding',
};

// Feature groups for organized display
const featureGroups = [
  {
    name: 'Core Features',
    features: ['pages', 'lead_magnets', 'funnels', 'campaigns', 'micro_courses'],
  },
  {
    name: 'Customization',
    features: ['custom_domains', 'subdomains', 'remove_branding', 'white_label'],
  },
  {
    name: 'Content & Products',
    features: ['digital_products', 'gated_content', 'storage_gb'],
  },
  {
    name: 'Marketing Tools',
    features: ['email_capture', 'analytics', 'ab_testing'],
  },
  {
    name: 'Advanced',
    features: ['api_access', 'team_members', 'priority_support'],
  },
];

export default function PricingPage() {
  const user = useUser();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchAllData();
    } else {
      // Still fetch plans even if not logged in
      fetchPlans();
      setLoading(false);
    }
  }, [userId]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSubscription(),
      fetchPlans(),
      checkSuperAdminStatus(),
    ]);
    setLoading(false);
  };

  const checkSuperAdminStatus = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/subscriptions?userId=${userId}`, {
        headers: { 'x-user-id': userId } as HeadersInit
      });
      if (response.ok) {
        const sub = await response.json();
        const planName = sub.plan?.name?.toLowerCase() || '';
        const planEnum = sub.plan?.planEnum || '';
        setIsSuperAdmin(
          planEnum === 'SUPER_ADMIN' || 
          planName.includes('super admin')
        );
      }
    } catch (error) {
      console.error('Error checking super admin status:', error);
      setIsSuperAdmin(false);
    }
  };

  const fetchSubscription = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/subscriptions?userId=${userId}`, {
        headers: { 'x-user-id': userId } as HeadersInit
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else if (response.status === 404) {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleUpgradeClick = (plan: Plan) => {
    if (!userId) {
      router.push('/handler/sign-in');
      return;
    }

    if (!subscription) {
      // Create new subscription
      handleCheckout(plan);
    } else {
      // Upgrade existing subscription
      router.push('/settings/billing');
      toast.success('Redirecting to billing page to upgrade...');
    }
  };

  const handleCheckout = async (plan: Plan) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        } as HeadersInit,
        body: JSON.stringify({
          planId: plan.id
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to start checkout');
      }
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPlanTier = (planId: string): number => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return -1;
    
    const tierMap: Record<string, number> = {
      'FREE': 0,
      'CREATOR': 1,
      'PRO': 2,
      'BUSINESS': 3,
      'SUPER_ADMIN': 4
    };
    
    if (plan.planEnum && tierMap[plan.planEnum] !== undefined) {
      return tierMap[plan.planEnum];
    }
    
    const planNameUpper = plan.name.toUpperCase();
    if (planNameUpper.includes('FREE')) return 0;
    if (planNameUpper.includes('CREATOR')) return 1;
    if (planNameUpper.includes('PRO')) return 2;
    if (planNameUpper.includes('BUSINESS')) return 3;
    
    return -1;
  };

  const filteredPlans = plans.filter((plan) => {
    const planName = plan.name?.toLowerCase() || '';
    const planEnum = plan.planEnum || '';
    const isSuperAdminPlan = planEnum === 'SUPER_ADMIN' || planName.includes('super admin');
    return !isSuperAdminPlan || isSuperAdmin;
  });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-600">Loading pricing information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600">
          Choose the plan that's right for your team. You can upgrade or downgrade anytime.
        </p>
      </header>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-10 mt-4">
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-full shadow-inner transition duration-300">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              !isYearly
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              isYearly
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="w-full max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          {filteredPlans.map((plan) => {
            const isCurrentPlan = subscription?.planId === plan.id;
            const currentTier = subscription ? getPlanTier(subscription.planId) : -1;
            const planTier = getPlanTier(plan.id);
            const isHigherTier = planTier > currentTier;
            const isLowerTier = planTier < currentTier;

            const planName = plan.name?.toLowerCase() || '';
            const planEnum = plan.planEnum || '';
            const isSuperAdminPlan = planEnum === 'SUPER_ADMIN' || planName.includes('super admin');

            // Calculate prices
            const monthlyPrice = Number(plan.price);
            const yearlyPrice = monthlyPrice * 10; // 17% discount
            const currentPrice = isYearly ? yearlyPrice : monthlyPrice;
            const priceDisplay = formatCurrency(currentPrice);
            const billingSuffix = isYearly ? '/yr' : '/mo';

            const isPopular = planEnum === 'PRO' || planEnum === 'CREATOR';

            let buttonText = 'Get Started';
            let buttonColor: 'primary' | 'secondary' = 'primary';
            
            if (isCurrentPlan) {
              buttonText = 'Current Plan';
              buttonColor = 'secondary';
            } else if (isSuperAdminPlan && !isSuperAdmin) {
              buttonText = 'Not Available';
              buttonColor = 'secondary';
            } else if (!subscription) {
              buttonText = 'Get Started';
              buttonColor = 'primary';
            } else if (isHigherTier) {
              buttonText = 'Upgrade';
              buttonColor = 'primary';
            } else if (isLowerTier) {
              buttonText = 'Downgrade';
              buttonColor = 'secondary';
            }

            const buttonClass =
              buttonColor === 'primary' && !isCurrentPlan && !(isSuperAdminPlan && !isSuperAdmin)
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : isCurrentPlan || (isSuperAdminPlan && !isSuperAdmin)
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-white hover:bg-gray-100 text-indigo-600 border border-indigo-600';

            // Main features in specific order
            const mainFeatureOrder = [
              { displayName: 'Pages', featureName: 'pages' },
              { displayName: 'Lead Magnets', featureName: 'email_capture' },
              { displayName: 'Funnels', featureName: 'email_capture' },
              { displayName: 'Campaigns', featureName: 'email_capture' },
              { displayName: 'Micro Courses', featureName: 'digital_products' },
            ];

            const mainFeatures = mainFeatureOrder.map((featureConfig) => {
              let planFeature = plan.features.find((pf) => pf.feature.name === featureConfig.featureName);
              
              if (!planFeature) {
                if (['Lead Magnets', 'Funnels', 'Campaigns'].includes(featureConfig.displayName)) {
                  planFeature = plan.features.find((pf) => pf.feature.name === 'email_capture');
                } else if (featureConfig.displayName === 'Micro Courses') {
                  planFeature = plan.features.find((pf) => pf.feature.name === 'digital_products');
                }
              }

              const included = planFeature 
                ? (planFeature.limit === null || planFeature.limit > 0)
                : false;
              
              const limit = featureConfig.displayName === 'Pages' 
                ? (planFeature?.limit ?? null)
                : null;

              return {
                name: featureConfig.displayName,
                included,
                limit,
                featureKey: featureConfig.displayName.toLowerCase().replace(' ', '_'),
              };
            });

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                  isPopular && !isCurrentPlan
                    ? 'border-4 border-indigo-600 bg-white'
                    : isCurrentPlan
                    ? 'border-4 border-blue-500 bg-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {isPopular && !isCurrentPlan && (
                  <div className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 bg-indigo-600 text-white text-xs font-bold uppercase rounded-full shadow-lg rotate-3">
                    Most Popular
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 bg-blue-500 text-white text-xs font-bold uppercase rounded-full shadow-lg rotate-3">
                    Current Plan
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 mb-6">{plan.description || 'Choose this plan for your needs'}</p>

                <div className="flex items-end mb-8">
                  <span className="text-5xl font-extrabold text-gray-900 leading-none">
                    {priceDisplay}
                  </span>
                  <span className="text-xl text-gray-500 ml-1 mb-1 font-medium">{billingSuffix}</span>
                  {isYearly && monthlyPrice > 0 && (
                    <span className="ml-3 text-sm text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                      Save {((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (isCurrentPlan) return;
                    if (isSuperAdminPlan && !isSuperAdmin) {
                      toast.error('This plan must be assigned by a super admin');
                      return;
                    }
                    handleUpgradeClick(plan);
                  }}
                  disabled={isCurrentPlan || (isSuperAdminPlan && !isSuperAdmin)}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors duration-200 shadow-md mb-8 ${buttonClass}`}
                  title={isSuperAdminPlan && !isSuperAdmin ? 'This plan must be assigned by a super admin' : undefined}
                >
                  {buttonText}
                </button>

                <ul className="space-y-4">
                  {mainFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      {feature.included ? <CheckIcon /> : <XIcon />}
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-base ${
                              feature.included ? 'text-gray-700' : 'text-gray-400 line-through'
                            }`}
                          >
                            {feature.name}
                            {feature.included && feature.limit !== null && (
                              <span className="text-gray-500 ml-1">
                                ({feature.limit})
                              </span>
                            )}
                            {feature.included && feature.limit === null && feature.name === 'Pages' && (
                              <span className="text-gray-500 ml-1">
                                (Unlimited)
                              </span>
                            )}
                          </span>
                          {featureDescriptions[feature.featureKey] && (
                            <div className="relative group">
                              <button
                                type="button"
                                onMouseEnter={() => setShowTooltip(feature.featureKey)}
                                onMouseLeave={() => setShowTooltip(null)}
                                className="focus:outline-none"
                              >
                                <InfoIcon />
                              </button>
                              {showTooltip === feature.featureKey && (
                                <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                                  {featureDescriptions[feature.featureKey]}
                                  <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="mb-8 bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare Plans</h2>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Features</th>
                {filteredPlans.map((plan) => (
                  <th key={plan.id} className="text-center py-4 px-4 font-semibold text-gray-900">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureGroups.map((group) => (
                <React.Fragment key={group.name}>
                  <tr className="bg-gray-50">
                    <td colSpan={filteredPlans.length + 1} className="py-3 px-4 font-bold text-gray-900 text-sm uppercase">
                      {group.name}
                    </td>
                  </tr>
                  {(() => {
                    const groupFeatures = group.features
                      .map((featureName) => {
                        const planFeature = filteredPlans[0]?.features.find(
                          (pf) => pf.feature.name === featureName
                        );
                        return planFeature
                          ? {
                              name: planFeature.feature.name,
                              displayName: planFeature.feature.displayName,
                            }
                          : null;
                      })
                      .filter((f): f is { name: string; displayName: string } => f !== null)
                      .sort((a, b) => a.displayName.localeCompare(b.displayName));

                    return groupFeatures.map((feature) => (
                      <tr key={feature.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {feature.displayName}
                            {featureDescriptions[feature.name] && (
                              <div className="relative group">
                                <button
                                  type="button"
                                  onMouseEnter={() => setShowTooltip(feature.name)}
                                  onMouseLeave={() => setShowTooltip(null)}
                                  className="focus:outline-none"
                                >
                                  <InfoIcon />
                                </button>
                                {showTooltip === feature.name && (
                                  <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                                    {featureDescriptions[feature.name]}
                                    <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        {filteredPlans.map((plan) => {
                          const planFeature = plan.features.find((pf) => pf.feature.name === feature.name);
                          const hasFeature = planFeature && (planFeature.limit === null || planFeature.limit > 0);
                          const limit = planFeature?.limit;

                          return (
                            <td key={plan.id} className="py-4 px-4 text-center">
                              {hasFeature ? (
                                <div className="flex items-center justify-center">
                                  <CheckIcon />
                                  {limit !== null && limit !== undefined ? (
                                    <span className="ml-2 text-sm text-gray-600">{limit}</span>
                                  ) : limit === null ? (
                                    <span className="ml-2 text-sm text-gray-600">Unlimited</span>
                                  ) : null}
                                </div>
                              ) : (
                                <XIcon />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-6">
          {featureGroups.map((group) => (
            <div key={group.name} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 text-sm uppercase">{group.name}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {(() => {
                  const groupFeatures = group.features
                    .map((featureName) => {
                      const planFeature = filteredPlans[0]?.features.find(
                        (pf) => pf.feature.name === featureName
                      );
                      return planFeature
                        ? {
                            name: planFeature.feature.name,
                            displayName: planFeature.feature.displayName,
                          }
                        : null;
                    })
                    .filter((f): f is { name: string; displayName: string } => f !== null)
                    .sort((a, b) => a.displayName.localeCompare(b.displayName));

                  return groupFeatures.map((feature) => (
                    <div key={feature.name} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{feature.displayName}</span>
                          {featureDescriptions[feature.name] && (
                            <div className="relative group">
                              <button
                                type="button"
                                onClick={() => setShowTooltip(showTooltip === feature.name ? null : feature.name)}
                                className="focus:outline-none"
                              >
                                <InfoIcon />
                              </button>
                              {showTooltip === feature.name && (
                                <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                                  {featureDescriptions[feature.name]}
                                  <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {filteredPlans.map((plan) => {
                          const planFeature = plan.features.find((pf) => pf.feature.name === feature.name);
                          const hasFeature = planFeature && (planFeature.limit === null || planFeature.limit > 0);
                          const limit = planFeature?.limit;

                          return (
                            <div key={plan.id} className="text-center">
                              <div className="text-xs font-medium text-gray-600 mb-1">{plan.name}</div>
                              {hasFeature ? (
                                <div className="flex items-center justify-center gap-1">
                                  <CheckIcon />
                                  {limit !== null && limit !== undefined ? (
                                    <span className="text-xs text-gray-600">{limit}</span>
                                  ) : limit === null ? (
                                    <span className="text-xs text-gray-600">Unlimited</span>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <XIcon />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

