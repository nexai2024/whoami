'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@stackframe/stack";
import WorkflowBuilder from '@/components/WorkflowBuilder';

export default function NewWorkflowPage() {
  const router = useRouter();
  const user = useUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">You need to be logged in to create a workflow.</p>
        </div>
      </div>
    );
  }

  const handleSave = (workflow: any) => {
    if (workflow && workflow.id) {
      router.push(`/workflows/${workflow.id}/edit`);
    }
  };

  return <WorkflowBuilder onSave={handleSave} />;
}
