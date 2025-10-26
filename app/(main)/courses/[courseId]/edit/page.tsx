'use client';

import React from 'react';
import { useUser } from "@stackframe/stack";
import CourseBuilder from '@/components/CourseBuilder';

interface EditCoursePageProps {
  params: {
    courseId: string;
  };
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const user = useUser();
  const { courseId } = params;

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">You need to be logged in to edit a course.</p>
        </div>
      </div>
    );
  }

  return <CourseBuilder courseId={courseId} />;
}
