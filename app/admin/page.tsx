'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiSettings, FiPackage, FiShield, FiDatabase,
  FiUsers, FiBarChart2, FiGlobe, FiAlertCircle,
  FiZap, FiDollarSign, FiActivity
} from 'react-icons/fi';

interface AdminCard {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  badge?: string;
}

export default function AdminDashboard() {
  const user = useUser();
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSuperAdmin();
  }, [user]);

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
        
        console.log('Admin check result:', { isSuperAdmin: admin });
        
        setIsSuperAdmin(admin);
        if (!admin) {
          console.log('User is not a super admin, redirecting to dashboard...');
          router.push('/dashboard');
        }
      } else {
        // Error checking admin status
        console.error('Error checking admin status:', response.status);
        setIsSuperAdmin(false);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsSuperAdmin(false);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const adminCards: AdminCard[] = [
    {
      id: 'plans',
      title: 'Plans & Features',
      description: 'Manage subscription plans, features, and pricing',
      href: '/admin/plans',
      icon: FiPackage,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'error-console',
      title: 'Error Console',
      description: 'View and manage application errors and logs',
      href: '/admin/error-console',
      icon: FiAlertCircle,
      color: 'from-red-500 to-pink-600',
    },
    {
      id: 'subdomain',
      title: 'Subdomain Management',
      description: 'Manage subdomains and custom domains',
      href: '/admin/subdomain',
      icon: FiGlobe,
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'View and manage user accounts and permissions',
      href: '/admin/users',
      icon: FiUsers,
      color: 'from-purple-500 to-violet-600',
      badge: 'Coming Soon',
    },
    {
      id: 'analytics',
      title: 'System Analytics',
      description: 'Platform-wide analytics and metrics',
      href: '/admin/analytics',
      icon: FiBarChart2,
      color: 'from-orange-500 to-amber-600',
      badge: 'Coming Soon',
    },
    {
      id: 'billing',
      title: 'Billing Overview',
      description: 'View all subscriptions and billing information',
      href: '/admin/billing',
      icon: FiDollarSign,
      color: 'from-teal-500 to-cyan-600',
      badge: 'Coming Soon',
    },
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
            <FiShield className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage platform settings and configurations</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiPackage className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiUsers className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">System Status</p>
              <p className="text-2xl font-bold text-green-600">Healthy</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiActivity className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              href={card.href}
              className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
            >
              {card.badge && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                  {card.badge}
                </span>
              )}
              <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-600 text-sm">{card.description}</p>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium group-hover:gap-2 transition-all">
                <span>Open</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/plans"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Create New Plan
          </Link>
          <Link
            href="/admin/error-console"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            View Errors
          </Link>
          <Link
            href="/admin/subdomain"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Manage Domains
          </Link>
        </div>
      </div>
    </div>
  );
}

