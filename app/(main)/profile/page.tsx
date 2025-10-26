'use client';
import { useUser, useStackApp, UserButton } from "@stackframe/stack";

export default function PageClient() {
  const user = useUser();
  const app = useStackApp();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      {user ? (
        /* Profile Card - Authenticated State */
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
            <div className="flex items-center gap-6">
              {/* User avatar circle with initial */}
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30">
                {user.displayName?.[0]?.toUpperCase() || user.primaryEmail?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {user.displayName || 'Welcome!'}
                </h2>
                <p className="text-purple-100 mt-1">
                  {user.primaryEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Display Name Card */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Display Name</label>
                <p className="text-lg font-semibold text-gray-900">
                  {user.displayName || 'Not set'}
                </p>
              </div>

              {/* Email Card */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Email Address</label>
                <p className="text-lg font-semibold text-gray-900">
                  {user.primaryEmail || 'Not available'}
                </p>
              </div>
            </div>

            {/* Stack UserButton and Sign Out */}
            <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
              <div>
                <UserButton />
              </div>
              <button
                onClick={() => user.signOut()}
                className="px-6 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Not Authenticated State */
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign In to View Profile</h2>
            <p className="text-gray-600 mb-8">
              Access your account to view and manage your profile information
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => app.redirectToSignIn()}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => app.redirectToSignUp()}
                className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}