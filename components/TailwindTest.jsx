// Test component to verify Tailwind CSS is working
import React from 'react';

const TailwindTest = () => {
  const baseStyles = "w-full p-6 rounded-xl border border-gray-200 transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white shadow-md hover:shadow-lg";
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center mb-8">Tailwind CSS Test</h1>
        
        {/* Test the exact baseStyles from BlockRenderer */}
        <div className={baseStyles}>
          <h3 className="font-semibold text-gray-900 mb-2">Test Card with baseStyles</h3>
          <p className="text-sm text-gray-600">This should have a white background, border, shadow, and rounded corners.</p>
        </div>
        
        {/* Test individual classes */}
        <div className="w-full p-6 bg-white border border-gray-200 rounded-xl shadow-md">
          <h3 className="font-semibold text-gray-900 mb-2">Individual Classes Test</h3>
          <p className="text-sm text-gray-600">Testing individual Tailwind classes.</p>
        </div>
        
        {/* Test hover effects */}
        <div className="w-full p-6 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
          <h3 className="font-semibold text-gray-900 mb-2">Hover Effects Test</h3>
          <p className="text-sm text-gray-600">Hover over this card to see effects.</p>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
