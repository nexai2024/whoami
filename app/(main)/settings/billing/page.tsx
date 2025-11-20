'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/**
 * Billing & Subscription Management Page
 * Integrates all subscription-related endpoints
 */

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

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  isActive: boolean;
  planEnum?: string; // FREE, CREATOR, PRO, BUSINESS
  features: Array<{
    feature: {
      name: string;
      displayName: string;
    };
    limit: number | null;
  }>;
}

interface UsageItem {
  featureName: string;
  displayName: string;
  used: number;
  limit: number | null;
  resetDate: string;
}

interface Invoice {
  id: string;
  number: string | null;
  amount: number;
  currency: string;
  status: string;
  date: string;
  dueDate: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  description: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  subscriptionId: string | null;
}

export default function BillingPage() {
  const user = useUser();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<UsageItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/handler/sign-in');
    }
  }, [user, router]);

  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchAllData();
    }
  }, [userId]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSubscription(),
      fetchPlans(),
      fetchUsage(),
      fetchInvoices(),
      checkSuperAdminStatus()
    ]);
    setLoading(false);
  };

  const checkSuperAdminStatus = async () => {
    if (!userId) return;
    try {
      // Check if user has super admin subscription
      const response = await fetch(`/api/subscriptions?userId=${userId}`, {
        headers: { 'x-user-id': userId } as HeadersInit
      });
      if (response.ok) {
        const sub = await response.json();
        // Check if plan name or planEnum indicates super admin
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
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to fetch subscription');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Failed to fetch subscription');
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

  const fetchUsage = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/usage?userId=${userId}`, {
        headers: { 'x-user-id': userId } as HeadersInit
      });

      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching usage:', errorData.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const fetchInvoices = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch('/api/billing/invoices', {
        headers: { 'x-user-id': userId } as HeadersInit
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching invoices:', errorData.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handleUpgradeClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleDowngradeClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowDowngradeModal(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan || !subscription || !userId) return;

    setActionLoading(true);
    try {
      // For new subscriptions, create checkout session
      if (!subscription.stripeSubscriptionId) {
        const checkoutResponse = await fetch('/api/subscriptions/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          } as HeadersInit,
          body: JSON.stringify({
            planId: selectedPlan.id
          })
        });

        if (checkoutResponse.ok) {
          const { url } = await checkoutResponse.json();
          window.location.href = url;
          return;
        } else {
          const error = await checkoutResponse.json();
          toast.error(error.error || 'Failed to start checkout');
          setActionLoading(false);
          return;
        }
      }

      // For existing subscriptions, update via API
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          prorate: true
        })
      });

      if (response.ok) {
        toast.success(`Upgraded to ${selectedPlan.name}!`);
        setShowUpgradeModal(false);
        await fetchSubscription();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upgrade subscription');
      }
    } catch (error) {
      toast.error('Failed to upgrade subscription. Please try again.');
    }
    setActionLoading(false);
  };

  const confirmDowngrade = async () => {
    if (!selectedPlan || !subscription || !userId) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json'
        } as HeadersInit,
        body: JSON.stringify({
          planId: selectedPlan.id,
          applyAtPeriodEnd: true
        })
      });

      if (response.ok) {
        toast.success(`Will downgrade to ${selectedPlan.name} at period end`);
        setShowDowngradeModal(false);
        await fetchSubscription();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to downgrade subscription');
      }
    } catch (error) {
      toast.error('Failed to downgrade subscription. Please try again.');
    }
    setActionLoading(false);
  };

  const confirmCancelSubscription = async () => {
    if (!subscription || !cancelConfirmed) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId! } as HeadersInit
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Subscription cancelled');
        setShowCancelModal(false);
        setCancelConfirmed(false);
        await fetchSubscription();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      toast.error('Failed to cancel. Please contact support.');
    }
    setActionLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlanTier = (planId: string): number => {
    // Get plan from the plans array
    const plan = plans.find(p => p.id === planId);
    if (!plan) return -1;
    
    // Map PlanEnum to tier number
    const tierMap: Record<string, number> = {
      'FREE': 0,
      'CREATOR': 1,
      'PRO': 2,
      'BUSINESS': 3
    };
    
    // Use planEnum if available (preferred method)
    if (plan.planEnum && tierMap[plan.planEnum] !== undefined) {
      return tierMap[plan.planEnum];
    }
    
    // Fallback: try to infer from plan name
    const planNameUpper = plan.name.toUpperCase();
    if (planNameUpper.includes('FREE')) return 0;
    if (planNameUpper.includes('CREATOR')) return 1;
    if (planNameUpper.includes('PRO')) return 2;
    if (planNameUpper.includes('BUSINESS')) return 3;
    
    return -1;
  };

  const scrollToPlans = () => {
    document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-600">Loading billing information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Billing & Subscription
        </h1>
        <p className="text-gray-600">
          Manage your subscription, view usage, and update billing information
        </p>
      </div>

      {/* Current Subscription Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Subscription</h2>

        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {subscription.plan.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xl text-gray-600 mt-2">
                  {formatCurrency(subscription.plan.price)} / {subscription.plan.interval}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Next billing date</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatDate(subscription.currentPeriodEnd)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {subscription.status === 'active' ? 'Renews automatically' : 'Expired'}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={scrollToPlans}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Upgrade Plan
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/billing/portal', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': userId || ''
                      }
                    });
                    if (response.ok) {
                      const { url } = await response.json();
                      window.location.href = url;
                    } else {
                      toast.error('Failed to open billing portal');
                    }
                  } catch (error) {
                    toast.error('Failed to open billing portal');
                  }
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium transition"
              >
                Change Payment Method
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No active subscription</p>
            <button
              onClick={scrollToPlans}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition"
            >
              View Plans
            </button>
          </div>
        )}
      </div>

      {/* Available Plans Grid */}
      <div id="plans-section" className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans
            .filter((plan) => {
              // Client-side filtering: Hide super admin plans from non-super admins (defense in depth)
              const planName = plan.name?.toLowerCase() || '';
              const planEnum = plan.planEnum || '';
              const isSuperAdminPlan = planEnum === 'SUPER_ADMIN' || planName.includes('super admin');
              
              // Show plan if: (1) it's not a super admin plan, OR (2) user is a super admin
              return !isSuperAdminPlan || isSuperAdmin;
            })
            .map((plan) => {
            const isCurrentPlan = subscription?.planId === plan.id;
            const currentTier = subscription ? getPlanTier(subscription.planId) : -1;
            const planTier = getPlanTier(plan.id);
            const isHigherTier = planTier > currentTier;
            const isLowerTier = planTier < currentTier;

            // Check if this is a super admin plan (for UI display)
            const planName = plan.name?.toLowerCase() || '';
            const planEnum = plan.planEnum || '';
            const isSuperAdminPlan = planEnum === 'SUPER_ADMIN' || planName.includes('super admin');

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-6 ${
                  isCurrentPlan
                    ? 'border-3 border-blue-500'
                    : 'border-2 border-gray-200'
                } hover:shadow-lg transition`}
              >
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  {plan.name}
                </h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 ? '$0' : formatCurrency(plan.price)}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">per {plan.interval}</div>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.slice(0, 5).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span className="text-gray-700">
                        {feature.feature.displayName}: {feature.limit ? feature.limit : 'Unlimited'}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (isCurrentPlan) return;
                    // Prevent action buttons for super admin plans (they can't be purchased)
                    if (isSuperAdminPlan && !isSuperAdmin) {
                      toast.error('This plan must be assigned by a super admin');
                      return;
                    }
                    if (isHigherTier) handleUpgradeClick(plan);
                    else if (isLowerTier) handleDowngradeClick(plan);
                  }}
                  disabled={isCurrentPlan || (isSuperAdminPlan && !isSuperAdmin)}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : isSuperAdminPlan && !isSuperAdmin
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : isHigherTier
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title={isSuperAdminPlan && !isSuperAdmin ? 'This plan must be assigned by a super admin' : undefined}
                >
                  {isCurrentPlan ? 'Current Plan' : isSuperAdminPlan && !isSuperAdmin ? 'Not Available' : isHigherTier ? 'Upgrade' : 'Downgrade'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Meter Section */}
      {usage.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage This Period</h2>

          <div className="space-y-4">
            {usage.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-medium text-gray-700">{item.displayName}</span>
                  <span className="text-gray-600">
                    {item.used} / {item.limit ? item.limit : 'Unlimited'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full transition-all"
                    style={{
                      width: item.limit
                        ? `${Math.min((item.used / item.limit) * 100, 100)}%`
                        : '10%'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing History</h2>

        {invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No billing history available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {invoice.description || 'Subscription'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatCurrency(invoice.amount)} {invoice.currency}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'open'
                            ? 'bg-yellow-100 text-yellow-800'
                            : invoice.status === 'void'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {invoice.invoicePdf || invoice.hostedInvoiceUrl ? (
                        <a
                          href={invoice.hostedInvoiceUrl || invoice.invoicePdf || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {invoice.invoicePdf ? 'Download PDF' : 'View Invoice'}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      {subscription && (
        <div className="bg-white rounded-2xl border-2 border-red-200 p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Danger Zone</h2>
          <p className="text-gray-700 mb-4">
            Cancel your subscription. You'll retain access until the end of your billing period.
          </p>
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium transition"
          >
            Cancel Subscription
          </button>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Upgrade to {selectedPlan.name}?
            </h2>
            <div className="space-y-3 mb-6">
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(selectedPlan.price)}/{selectedPlan.interval}
              </div>
              <p className="text-sm text-gray-600">
                You'll be charged a prorated amount for the remainder of this billing period
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-2">New features:</div>
                <ul className="space-y-1">
                  {selectedPlan.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      • {feature.feature.displayName}: {feature.limit || 'Unlimited'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpgrade}
                disabled={actionLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Upgrade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Modal */}
      {showDowngradeModal && selectedPlan && subscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Downgrade to {selectedPlan.name}?
            </h2>
            <div className="space-y-3 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  This will take effect at the end of your current billing period ({formatDate(subscription.currentPeriodEnd)})
                </p>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-2">You'll lose access to:</div>
                <ul className="space-y-1">
                  {subscription.plan.features.filter(f =>
                    !selectedPlan.features.find(sf => sf.feature.name === f.feature.name)
                  ).slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      • {feature.feature.displayName}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDowngradeModal(false)}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDowngrade}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Downgrade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && subscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cancel Subscription?
            </h2>
            <div className="space-y-4 mb-6">
              <p className="text-gray-700">
                Your subscription will remain active until {formatDate(subscription.currentPeriodEnd)}, then you'll be moved to the Free plan
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cancelConfirmed}
                  onChange={(e) => setCancelConfirmed(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  I understand I'll lose access to Pro features
                </span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelConfirmed(false);
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                Keep Subscription
              </button>
              <button
                onClick={confirmCancelSubscription}
                disabled={!cancelConfirmed || actionLoading}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
