
import React from 'react';
import CourseBuilder from '@/components/CourseBuilder';
import EditCourseClient from './EditCourseClient';

interface EditCoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { courseId } = await params;
  
  return <EditCourseClient courseId={courseId} />;
}
