"use client";
import { useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { onboardingComplete } from '../onboarding-functions';
export default function OnboardingPage() {
  const user = useUser();
  const router = useRouter();
  const [address, setAddress] = useState('');


  return ( <>
    <input 
      type="text" 
      value={address} 
      onChange={(e) => setAddress(e.target.value)} 
    />

    <button onClick={async () => {
      if (user) {
        await onboardingComplete();
        router.push('/dashboard');
      }
    }}>
      Submit
    </button>
  </>);
}