'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiCheck,
  FiSettings, FiPackage, FiZap, FiDollarSign
} from 'react-icons/fi';

interface Feature {
  id: string;
  name: string;
  description: string | null;
  type: string;
}

interface PlanFeature {
  id: string;
  featureId: string;
  enabled: boolean;
  limit: number | null;
  rateLimit: number | null;
  ratePeriod: string | null;
  feature: Feature;
}

interface Plan {
  id: string;
  name: string;
  description: string | null;
  planEnum: string;
  price: number;
  interval: string;
  isActive: boolean;
  features: PlanFeature[];
}

export default function AdminPlansPage() {
  const user = useUser();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Modal states
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  // Form states
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    planEnum: 'FREE',
    price: '0',
    interval: 'month',
    isActive: true,
  });
  
  const [featureForm, setFeatureForm] = useState({
    name: '',
    description: '',
    type: 'quota',
  });

  useEffect(() => {
    checkSuperAdmin();
  }, [user]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin]);

  const checkSuperAdmin = async () => {
    if (!user?.id) {
      router.push('/handler/sign-in');
      return;
    }

    try {
      // Use dedicated admin check endpoint
      const response = await fetch('/api/admin/check');
      
      if (response.ok) {
        const data = await response.json();
        const admin = data.isSuperAdmin || false;
        setIsSuperAdmin(admin);
        if (!admin) {
          toast.error('Access denied. Super admin required.');
          router.push('/dashboard');
        }
      } else {
        setIsSuperAdmin(false);
        toast.error('Error checking admin status');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsSuperAdmin(false);
      toast.error('Error checking admin status');
      router.push('/dashboard');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, featuresRes] = await Promise.all([
        fetch('/api/admin/plans'),
        fetch('/api/admin/features'),
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData);
      }

      if (featuresRes.ok) {
        const featuresData = await featuresRes.json();
        setFeatures(featuresData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      description: '',
      planEnum: 'FREE',
      price: '0',
      interval: 'month',
      isActive: true,
    });
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      planEnum: plan.planEnum,
      price: plan.price.toString(),
      interval: plan.interval,
      isActive: plan.isActive,
    });
    setShowPlanModal(true);
  };

  const handleSavePlan = async () => {
    try {
      const url = editingPlan
        ? `/api/admin/plans/${editingPlan.id}`
        : '/api/admin/plans';
      
      const method = editingPlan ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm),
      });

      if (response.ok) {
        toast.success(editingPlan ? 'Plan updated' : 'Plan created');
        setShowPlanModal(false);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save plan');
      }
    } catch (error) {
      toast.error('Failed to save plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Plan deleted');
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete plan');
      }
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const handleCreateFeature = () => {
    setEditingFeature(null);
    setFeatureForm({ name: '', description: '', type: 'quota' });
    setShowFeatureModal(true);
  };

  const handleEditFeature = (feature: Feature) => {
    setEditingFeature(feature);
    setFeatureForm({
      name: feature.name,
      description: feature.description || '',
      type: feature.type,
    });
    setShowFeatureModal(true);
  };

  const handleSaveFeature = async () => {
    try {
      const url = editingFeature
        ? `/api/admin/features/${editingFeature.id}`
        : '/api/admin/features';
      
      const method = editingFeature ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(featureForm),
      });

      if (response.ok) {
        toast.success(editingFeature ? 'Feature updated' : 'Feature created');
        setShowFeatureModal(false);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save feature');
      }
    } catch (error) {
      toast.error('Failed to save feature');
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;

    try {
      const response = await fetch(`/api/admin/features/${featureId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Feature deleted');
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete feature');
      }
    } catch (error) {
      toast.error('Failed to delete feature');
    }
  };

  const handleAddFeatureToPlan = async (planId: string, featureId: string, limit: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/plans/${planId}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureId,
          enabled,
          limit: limit === '' || limit === 'unlimited' ? null : parseInt(limit),
        }),
      });

      if (response.ok) {
        toast.success('Feature added to plan');
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add feature');
      }
    } catch (error) {
      toast.error('Failed to add feature');
    }
  };

  const handleUpdatePlanFeature = async (planId: string, featureId: string, limit: string, enabled: boolean) => {
    await handleAddFeatureToPlan(planId, featureId, limit, enabled);
  };

  const handleRemoveFeatureFromPlan = async (planId: string, featureId: string) => {
    if (!confirm('Remove this feature from the plan?')) return;

    try {
      const response = await fetch(`/api/admin/plans/${planId}/features/${featureId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Feature removed');
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove feature');
      }
    } catch (error) {
      toast.error('Failed to remove feature');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Plan & Feature Management</h1>
        <p className="text-gray-600">Manage subscription plans and features</p>
      </div>

      {/* Plans Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Plans</h2>
          <button
            onClick={handleCreatePlan}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <FiPlus /> New Plan
          </button>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600">
                    ${plan.price}/{plan.interval} • {plan.planEnum} • {plan.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 />
                  </button>
                  <button
                    onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                  >
                    <FiSettings />
                  </button>
                </div>
              </div>

              {selectedPlan?.id === plan.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
                  
                  {/* Existing Features */}
                  <div className="space-y-2 mb-4">
                    {plan.features.map((pf) => (
                      <div key={pf.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <span className="font-medium">{pf.feature.description || pf.feature.name}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            ({pf.feature.type}) • Limit: {pf.limit ?? 'Unlimited'} • {pf.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Limit"
                            defaultValue={pf.limit ?? ''}
                            onBlur={(e) => {
                              const newLimit = e.target.value;
                              handleUpdatePlanFeature(plan.id, pf.featureId, newLimit, pf.enabled);
                            }}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => handleRemoveFeatureFromPlan(plan.id, pf.featureId)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <FiX />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Feature */}
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => {
                        const featureId = e.target.value;
                        if (featureId) {
                          const feature = features.find(f => f.id === featureId);
                          if (feature) {
                            const limit = prompt('Enter limit (leave empty for unlimited):');
                            handleAddFeatureToPlan(plan.id, featureId, limit || '', true);
                            e.target.value = '';
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Add Feature...</option>
                      {features
                        .filter(f => !plan.features.find(pf => pf.featureId === f.id))
                        .map(f => (
                          <option key={f.id} value={f.id}>
                            {f.description || f.name} ({f.type})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Features</h2>
          <button
            onClick={handleCreateFeature}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <FiPlus /> New Feature
          </button>
        </div>

        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">{feature.description || feature.name}</span>
                <span className="text-sm text-gray-600 ml-2">({feature.type})</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditFeature(feature)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDeleteFeature(feature.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingPlan ? 'Edit Plan' : 'New Plan'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Enum</label>
                <select
                  value={planForm.planEnum}
                  onChange={(e) => setPlanForm({ ...planForm, planEnum: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="FREE">FREE</option>
                  <option value="CREATOR">CREATOR</option>
                  <option value="PRO">PRO</option>
                  <option value="BUSINESS">BUSINESS</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                  <select
                    value={planForm.interval}
                    onChange={(e) => setPlanForm({ ...planForm, interval: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPlanModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingFeature ? 'Edit Feature' : 'New Feature'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={featureForm.name}
                  onChange={(e) => setFeatureForm({ ...featureForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., pages, storage_gb"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={featureForm.description}
                  onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Display name for the feature"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={featureForm.type}
                  onChange={(e) => setFeatureForm({ ...featureForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="quota">Quota</option>
                  <option value="boolean">Boolean</option>
                  <option value="rate_limit">Rate Limit</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFeatureModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFeature}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

