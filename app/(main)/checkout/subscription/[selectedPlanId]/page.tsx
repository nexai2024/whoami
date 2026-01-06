//create a page that allows the user to checkout for a subscription using stripe and checkoutform component
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CheckoutForm from '@/components/payments/CheckoutForm';

export default function CheckoutPage() {
  const [planId, setPlanId] = useState<string | null>(null);
  const params = useParams();

  useEffect(() => {
    // If params is an object possibly like { selectedPlanId: '123' }
    // try to extract the actual planId value
    const paramValue =
      typeof params === 'object' && params !== null && 'selectedPlanId' in params
        ? (params as Record<string, string>).selectedPlanId
        : null;
    setPlanId(paramValue ?? null);
  }, [params]);

  return (      
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
        <CheckoutForm />
    </div>
  );
}