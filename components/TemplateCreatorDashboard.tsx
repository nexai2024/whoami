"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import Image from 'next/image';

const {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiStar,
  FiEdit,
  FiSettings,
  FiBarChart2
} = FiIcons;

interface TemplateCreatorDashboardProps {
  userId?: string;
}

const TemplateCreatorDashboard: React.FC<TemplateCreatorDashboardProps> = ({
  userId
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchTemplates();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/templates/creator/profile`, {
        headers: {
          'x-user-id': userId || 'demo-user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates/pages?myTemplates=true', {
        headers: {
          'x-user-id': userId || 'demo-user'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTemplatePricing = async (templateId: string, price: number, isPaid: boolean) => {
    try {
      const response = await fetch(`/api/templates/pages/${templateId}/pricing`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || 'demo-user'
        },
        body: JSON.stringify({
          price,
          isPaid,
          licenseType: isPaid ? 'paid' : 'free'
        })
      });

      if (response.ok) {
        toast.success('Pricing updated!');
        fetchTemplates();
      } else {
        toast.error('Failed to update pricing');
      }
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast.error('Failed to update pricing');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Creator Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your templates and earnings</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <FiSettings />
          Settings
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <FiDollarSign className="text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${stats.totalRevenue.toFixed(2)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Sales</span>
              <FiTrendingUp className="text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalSales}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Templates</span>
              <FiUsers className="text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalTemplates}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Rating</span>
              <FiStar className="text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.averageRating?.toFixed(1) || '0.0'}
            </div>
          </div>
        </div>
      )}

      {/* My Templates */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Templates</h3>
        <div className="space-y-4">
          {templates.map(template => (
            <TemplatePricingCard
              key={template.id}
              template={template}
              onUpdatePricing={updateTemplatePricing}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const TemplatePricingCard: React.FC<{
  template: any;
  onUpdatePricing: (id: string, price: number, isPaid: boolean) => void;
}> = ({ template, onUpdatePricing }) => {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(template.price || 0);
  const [isPaid, setIsPaid] = useState(template.isPaid || false);

  const handleSave = () => {
    onUpdatePricing(template.id, price, isPaid);
    setEditing(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-4">
        <Image
          src={template.thumbnailUrl}
          alt={template.name}
          width={120}
          height={67}
          className="rounded"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{template.name}</h4>
            <button
              onClick={() => setEditing(!editing)}
              className="text-indigo-600 hover:text-indigo-700"
            >
              <FiEdit />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{template.useCount} uses</span>
            <span>{template.totalSales || 0} sales</span>
            <span>${template.totalRevenue || 0} revenue</span>
          </div>

          {editing && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="mr-2"
                  />
                  Make this template paid
                </label>
              </div>
              {isPaid && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateCreatorDashboard;






