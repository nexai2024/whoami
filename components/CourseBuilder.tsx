"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const {
  FiPlus, FiSave, FiEye, FiSettings, FiTrash2, FiEdit3, FiMove,
  FiVideo, FiFileText, FiHeadphones, FiBook, FiCheck, FiX, FiUpload, 
  FiHelpCircle
} = FiIcons;

interface Lesson {
  id?: string;
  title: string;
  description?: string;
  order: number;
  contentType: string;
  content?: string;
  videoUrl?: string;
  videoLength?: number;
  audioUrl?: string;
  hasQuiz: boolean;
  quizData?: any;
  dripDay?: number;
  isFree: boolean;
}

interface CourseBuilderProps {
  courseId?: string;
  onSave?: (data: any) => void;
}

interface QuizBuilderProps {
  lesson: Lesson;
  updateLesson: (data: any) => void;
}

// Quiz Builder Component
const QuizBuilder: React.FC<QuizBuilderProps> = ({ lesson, updateLesson }) => {
  const quizData = lesson.quizData || { questions: [], passingScore: 70, timeLimit: 600 };
  const [questions, setQuestions] = useState(quizData.questions || []);
  const [passingScore, setPassingScore] = useState(quizData.passingScore || 70);
  const [timeLimit, setTimeLimit] = useState(quizData.timeLimit || 600);

  useEffect(() => {
    updateLesson({ ...lesson, quizData: { questions, passingScore, timeLimit } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, passingScore, timeLimit]);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: `q${Date.now()}`,
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10
    }]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q: { id: string; }) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: any) => {
    setQuestions(questions.map((q: { id: string; }) => q.id === id ? { ...q, ...updates } : q));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map((q: { id: string; options: any; }) => 
      q.id === questionId 
        ? { ...q, options: [...q.options, ''] }
        : q
    ));
  };

  const removeOption = (questionId: string, index: number) => {
    setQuestions(questions.map((q: { id: string; options: any[]; }) => 
      q.id === questionId 
        ? { ...q, options: q.options.filter((_: any, i: number) => i !== index) }
        : q
    ));
  };

  const updateOption = (questionId: string, index: number, value: string) => {
    setQuestions(questions.map((q: { id: string; options: any[]; }) => 
      q.id === questionId 
        ? { ...q, options: q.options.map((opt: any, i: number) => i === index ? value : opt) }
        : q
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FiHelpCircle className="text-indigo-600" />
        <span className="text-sm font-medium text-gray-900">Quiz Builder</span>
        <span className="text-xs text-gray-500">({questions.length} questions)</span>
      </div>

      {/* Quiz Settings */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Passing Score (%)
          </label>
          <input
            type="number"
            value={passingScore}
            onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Time Limit (sec)
          </label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
            min="0"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {questions.map((q: { id: React.Key | null | undefined; question: string | number | readonly string[] | undefined; type: string; options: any[]; correctAnswer: any; }, idx: number) => (
          <div key={q.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Question {idx + 1}</span>
              <button
                onClick={() => q.id && removeQuestion(String(q.id))}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                <FiX />
              </button>
            </div>

            <input
              type="text"
              value={q.question || ""}
              onChange={(e) => updateQuestion(String(q.id), { question: e.target.value })}
              placeholder="Enter your question"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded mb-2 focus:ring-1 focus:ring-indigo-500"
            />

            {q.type === 'multiple-choice' && (
              <div className="space-y-1">
                {q.options.map((opt: string | number | readonly string[] | undefined, optIdx: React.Key | null | undefined) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={q.correctAnswer === optIdx}
                      onChange={() => updateQuestion(String(q.id), { correctAnswer: optIdx })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(String(q.id), typeof optIdx === 'number' ? optIdx : Number(optIdx), e.target.value)}
                      placeholder={`Option ${typeof optIdx === 'number' ? optIdx + 1 : Number(optIdx) + 1}`}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                    />
                    {q.options.length > 2 && (
                      <button
                        onClick={() => removeOption(String(q.id), typeof optIdx === 'number' ? optIdx : Number(optIdx))}
                        className="text-red-600 text-xs px-1"
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addOption(String(q.id))}
                  className="text-xs text-indigo-600 hover:text-indigo-800 mt-1"
                >
                  <FiPlus className="inline mr-1" /> Add Option
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600"
      >
        <FiPlus />
        Add Question
      </button>

      {questions.length === 0 && (
        <p className="text-xs text-center text-gray-500 py-2">
          No questions yet. Click "Add Question" to get started.
        </p>
      )}
    </div>
  );
};

const CourseBuilder: React.FC<CourseBuilderProps> = ({ courseId, onSave }) => {
  const [course, setCourse] = useState<any>({
    title: '',
    description: '',
    slug: '',
    level: 'BEGINNER',
    accessType: 'FREE',
    isLeadMagnet: false,
    requiresEmail: false
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'lessons'>('details');
  const [saving, setSaving] = useState(false);
  const [internalCourseId, setInternalCourseId] = useState<string | undefined>(courseId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (internalCourseId) {
      loadCourse();
    }
  }, [internalCourseId]);

  useEffect(() => {
    setInternalCourseId(courseId);
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${internalCourseId}`, {
        headers: { 'x-user-id': 'demo-user' }
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
        setLessons(data.course.lessons || []);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
    }
  };

  const handleSaveCourse = async () => {
    try {
      setSaving(true);

      if (!internalCourseId) {
        // Create new course
        const response = await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'demo-user'
          },
          body: JSON.stringify(course)
        });

        if (response.ok) {
          const data = await response.json();
          setInternalCourseId(data.course.id);
          toast.success('Course created!');
          if (onSave) onSave(data.course);
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to create course');
        }
      } else {
        // Update existing course
        const response = await fetch(`/api/courses/${internalCourseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'demo-user'
          },
          body: JSON.stringify(course)
        });

        if (response.ok) {
          toast.success('Course updated!');
        } else {
          toast.error('Failed to update course');
        }
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishCourse = async () => {
    if (!internalCourseId) {
      toast.error('Save course first before publishing');
      return;
    }

    try {
      const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const response = await fetch(`/api/courses/${internalCourseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({ ...course, status: newStatus })
      });

      if (response.ok) {
        setCourse({ ...course, status: newStatus });
        toast.success(newStatus === 'PUBLISHED' ? 'Course published!' : 'Course unpublished');
      } else {
        toast.error('Failed to update course status');
      }
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error('Failed to update course status');
    }
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      title: `Lesson ${lessons.length + 1}`,
      order: lessons.length,
      contentType: 'VIDEO',
      hasQuiz: false,
      isFree: false
    };

    setLessons([...lessons, newLesson]);
    setSelectedLesson(newLesson);
  };

  const saveLesson = async (lesson: Lesson) => {
    if (!internalCourseId) {
      toast.error('Save course first before adding lessons');
      return;
    }

    try {
      const response = await fetch(`/api/courses/${internalCourseId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify(lesson)
      });

      if (response.ok) {
        const data = await response.json();
        setLessons(lessons.map(l =>
          l.order === lesson.order ? data.lesson : l
        ));
        toast.success('Lesson saved!');
      } else {
        toast.error('Failed to save lesson');
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Failed to save lesson');
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex(l => l.order === active.id);
    const newIndex = lessons.findIndex(l => l.order === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(lessons, oldIndex, newIndex);
    const reorderedWithNewOrder = reordered.map((lesson, index) => ({
      ...lesson,
      order: index
    }));

    setLessons(reorderedWithNewOrder);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return FiVideo;
      case 'TEXT': return FiFileText;
      case 'AUDIO': return FiHeadphones;
      default: return FiBook;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Course Builder</h1>
              {course.status && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  course.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {course.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toast.custom('Preview coming soon')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FiEye />
                Preview
              </button>
              <button
                onClick={handleSaveCourse}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <FiSave />
                {saving ? 'Saving...' : 'Save Course'}
              </button>
              {internalCourseId && (
                <button
                  onClick={handlePublishCourse}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    course.status === 'PUBLISHED'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <FiUpload />
                  {course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Course Details
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'lessons'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Lessons ({lessons.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'details' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-6">Course Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="The Complete Guide to..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={course.description || ''}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="What will students learn in this course?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={course.slug}
                  onChange={(e) => setCourse({ ...course, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="course-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  value={course.level}
                  onChange={(e) => setCourse({ ...course, level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="ALL_LEVELS">All Levels</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Type
                </label>
                <select
                  value={course.accessType}
                  onChange={(e) => setCourse({ ...course, accessType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="FREE">Free</option>
                  <option value="EMAIL_GATE">Email Gate</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>

              {course.accessType === 'PAID' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    value={course.price || ''}
                    onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="49.00"
                    step="0.01"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <div className="flex items-center gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={course.isLeadMagnet}
                      onChange={(e) => setCourse({ ...course, isLeadMagnet: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Use as Lead Magnet</span>
                  </label>

                  {course.isLeadMagnet && (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={course.requiresEmail}
                        onChange={(e) => setCourse({ ...course, requiresEmail: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Require Email</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Lessons List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Lessons</h2>
                  <button
                    onClick={addLesson}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <FiPlus />
                    Add Lesson
                  </button>
                </div>

                {lessons.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FiBook className="text-5xl mx-auto mb-4 text-gray-400" />
                    <p>No lessons yet. Click "Add Lesson" to get started.</p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={lessons.map(l => l.order)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {lessons.map((lesson, index) => {
                          const Icon = getContentTypeIcon(lesson.contentType);
                          return (
                            <div
                              key={lesson.order}
                              onClick={() => setSelectedLesson(lesson)}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedLesson?.order === lesson.order
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <FiMove className="text-gray-400" />
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                                    {index + 1}
                                  </div>
                                </div>
                                <Icon className="text-gray-600" />
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                                  <p className="text-sm text-gray-500">{lesson.contentType}</p>
                                </div>
                                {lesson.isFree && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                    Free Preview
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            {/* Lesson Editor */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
                {selectedLesson ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Edit Lesson</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson Title
                      </label>
                      <input
                        type="text"
                        value={selectedLesson.title}
                        onChange={(e) => setSelectedLesson({ ...selectedLesson, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Type
                      </label>
                      <select
                        value={selectedLesson.contentType}
                        onChange={(e) => setSelectedLesson({ ...selectedLesson, contentType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="VIDEO">Video</option>
                        <option value="TEXT">Text</option>
                        <option value="AUDIO">Audio</option>
                        <option value="PDF">PDF</option>
                      </select>
                    </div>

                    {selectedLesson.contentType === 'VIDEO' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video URL
                        </label>
                        <input
                          type="url"
                          value={selectedLesson.videoUrl || ''}
                          onChange={(e) => setSelectedLesson({ ...selectedLesson, videoUrl: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="https://..."
                        />
                      </div>
                    )}

                    {selectedLesson.contentType === 'TEXT' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content
                        </label>
                        <textarea
                          value={selectedLesson.content || ''}
                          onChange={(e) => setSelectedLesson({ ...selectedLesson, content: e.target.value })}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                          placeholder="Lesson content..."
                        />
                      </div>
                    )}

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedLesson.isFree}
                          onChange={(e) => setSelectedLesson({ ...selectedLesson, isFree: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Free Preview</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Drip Schedule (days)
                      </label>
                      <input
                        type="number"
                        value={selectedLesson.dripDay || ''}
                        onChange={(e) => setSelectedLesson({ ...selectedLesson, dripDay: parseInt(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="0 = immediate"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Release this lesson N days after enrollment
                      </p>
                    </div>

                    {/* Quiz Section */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedLesson.hasQuiz}
                            onChange={(e) => setSelectedLesson({ ...selectedLesson, hasQuiz: e.target.checked })}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">Add Quiz</span>
                        </label>
                        {selectedLesson.hasQuiz && (
                          <button
                            onClick={() => setSelectedLesson({ ...selectedLesson, hasQuiz: false, quizData: null })}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove Quiz
                          </button>
                        )}
                      </div>

                      {selectedLesson.hasQuiz && (
                        <QuizBuilder 
                          lesson={selectedLesson}
                          updateLesson={(data) => setSelectedLesson({ ...selectedLesson, quizData: data })}
                        />
                      )}
                    </div>

                    <button
                      onClick={() => saveLesson(selectedLesson)}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 mt-4"
                    >
                      Save Lesson
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FiEdit3 className="text-4xl mx-auto mb-4 text-gray-400" />
                    <p>Select a lesson to edit</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseBuilder;
