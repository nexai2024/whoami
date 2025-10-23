'use client';

import { useState, useEffect } from 'react';

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

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<UsageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const userId = 'demo-user'; // TODO: Get from auth context

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSubscription(),
      fetchPlans(),
      fetchUsage()
    ]);
    setLoading(false);
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/subscriptions?userId=${userId}`, {
        headers: { 'x-user-id': userId }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else if (response.status === 404) {
        setSubscription(null);
      } else {
        console.error('Failed to fetch subscription');
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

  const fetchUsage = async () => {
    try {
      const response = await fetch(`/api/usage?userId=${userId}`, {
        headers: { 'x-user-id': userId }
      });

      if (response.ok) {
        const data = await response.json();
        setUsage(data.usage || []);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
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
    if (!selectedPlan || !subscription) return;

    setActionLoading(true);
    try {
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
        showToast(`Upgraded to ${selectedPlan.name}!`, 'success');
        setShowUpgradeModal(false);
        await fetchSubscription();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to upgrade subscription', 'error');
      }
    } catch (error) {
      showToast('Failed to upgrade subscription. Please try again.', 'error');
    }
    setActionLoading(false);
  };

  const confirmDowngrade = async () => {
    if (!selectedPlan || !subscription) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          applyAtPeriodEnd: true
        })
      });

      if (response.ok) {
        showToast(`Will downgrade to ${selectedPlan.name} at period end`, 'success');
        setShowDowngradeModal(false);
        await fetchSubscription();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to downgrade subscription', 'error');
      }
    } catch (error) {
      showToast('Failed to downgrade subscription. Please try again.', 'error');
    }
    setActionLoading(false);
  };

  const confirmCancelSubscription = async () => {
    if (!subscription || !cancelConfirmed) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });

      if (response.ok) {
        const data = await response.json();
        showToast(data.message || 'Subscription cancelled', 'success');
        setShowCancelModal(false);
        setCancelConfirmed(false);
        await fetchSubscription();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to cancel subscription', 'error');
      }
    } catch (error) {
      showToast('Failed to cancel. Please contact support.', 'error');
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
    const tiers: Record<string, number> = {
      'plan_free': 0,
      'plan_pro': 1,
      'plan_enterprise': 2
    };
    return tiers[planId] || 0;
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
                onClick={() => showToast('Coming soon', 'success')}
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
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.planId === plan.id;
            const currentTier = subscription ? getPlanTier(subscription.planId) : -1;
            const planTier = getPlanTier(plan.id);
            const isHigherTier = planTier > currentTier;
            const isLowerTier = planTier < currentTier;

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
                    if (isHigherTier) handleUpgradeClick(plan);
                    else if (isLowerTier) handleDowngradeClick(plan);
                  }}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : isHigherTier
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : isHigherTier ? 'Upgrade' : 'Downgrade'}
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm text-gray-900">Dec 15, 2024</td>
                <td className="py-3 px-4 text-sm text-gray-900">$29.00</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Paid</span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => showToast('Invoice downloads coming soon', 'success')}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Download
                  </button>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm text-gray-900">Nov 15, 2024</td>
                <td className="py-3 px-4 text-sm text-gray-900">$29.00</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Paid</span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => showToast('Invoice downloads coming soon', 'success')}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Download
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
