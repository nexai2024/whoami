'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@stackframe/stack";
import CourseBuilder from '@/components/CourseBuilder';

export default function NewCoursePage() {
  const router = useRouter();
  const user = useUser();

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">You need to be logged in to create a course.</p>
        </div>
      </div>
    );
  }

  const handleSave = (course: any) => {
    // Redirect to edit page after successful creation
    if (course && course.id) {
      router.push(`/courses/${course.id}/edit`);
    }
  };

  return <CourseBuilder onSave={handleSave} />;
}
