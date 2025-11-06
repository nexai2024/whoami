'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from "@stackframe/stack";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiLock, FiChevronLeft, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CourseLearnPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CourseLearnPage({ params }: CourseLearnPageProps) {
  const [slug, setSlug] = useState<string>('');
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenEnrollment, setTokenEnrollment] = useState<any>(null);

  // Resolve params promise - params is a Promise in Next.js 15+
  useEffect(() => {
    console.log('params');
    let isMounted = true;
    
    async function loadSlug() {
      try {
        const resolvedParams = await params;
        if (isMounted) {
          setSlug(resolvedParams.slug);
        }
      } catch (error) {
        console.error('Error resolving params:', error);
        if (isMounted) {
          toast.error('Failed to load course page');
        }
      }
    }
    
    loadSlug();
    
    return () => {
      isMounted = false;
    };
  });

  useEffect(() => {
    console.log('slug', slug);
    if (!slug) return; // Wait for slug to be resolved
    // Check for access token in URL
    const token = searchParams.get('token');
    if (token) {
      setAccessToken(token);
      validateTokenAndLoad(token);
    } else if (user) {
      console.log('loading course and progress for user', user);
      loadCourseAndProgress();
    } else {
      console.log('no user, redirecting to course landing page');
      toast.error('Please log in or use a valid access link');
      router.push(`/c/${slug}`);
    }
  }, [slug, user, searchParams, router]);

  // Reset quiz state when changing lessons
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  }, [currentLessonIndex]);

  const validateTokenAndLoad = async (token: string) => {
    try {
      setLoading(true);
      
      // Validate token
      const tokenResponse = await fetch(`/api/courses/access/${token}`);
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        toast.error(errorData.error || 'Invalid or expired access link');
        router.push(`/c/${slug}`);
        return;
      }

      const enrollmentData = await tokenResponse.json();
      setTokenEnrollment(enrollmentData.enrollment);

      // Load course
      const courseResponse = await fetch(`/api/courses/slug/${slug}`);

      if (!courseResponse.ok) {
        toast.error('Course not found');
        router.push('/courses');
        return;
      }

      const courseData = await courseResponse.json();
      setCourse(courseData);

      // Load lessons
      const lessonsResponse = await fetch(`/api/courses/${courseData.id}/lessons`);

      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        setCourse((prev: any) => ({
          ...prev,
          lessons: lessonsData.lessons || []
        }));
      }

      // Load progress for this enrollment
      const progressResponse = await fetch(`/api/courses/${courseData.id}/progress?enrollmentId=${enrollmentData.enrollment.id}`);

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Error validating token and loading course:', error);
      toast.error('Failed to load course');
      router.push(`/c/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseAndProgress = async () => {
    try {
      setLoading(true);
      console.log('loading course and progress 2 for user', user);
      // Load course
      const courseResponse = await fetch(`/api/courses/slug/${slug}`, {
        headers: { 'x-user-id': user?.id || '' }
      });

      if (!courseResponse.ok) {
        toast.error('Course not found');
        router.push('/courses');
        return;
      }

      const courseData = await courseResponse.json();

      // Check if enrolled (skip for token-based access)
      if (!accessToken && !courseData.isEnrolled) {
        toast.error('You are not enrolled in this course');
        router.push(`/c/${slug}`);
        return;
      }

      // Load full lesson content
      const lessonsResponse = await fetch(`/api/courses/${courseData.id}/lessons`, {
        headers: accessToken ? {} : { 'x-user-id': user?.id || '' }
      });

      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        courseData.lessons = lessonsData.lessons;
      }

      setCourse(courseData);

      // Load progress
      const progressResponse = await fetch(`/api/courses/${courseData.id}/progress`, {
        headers: accessToken ? {} : { 'x-user-id': user?.id || '' },
        ...(accessToken && tokenEnrollment ? { 
          method: 'GET',
          // Add enrollmentId as query param if needed
        } : {})
      });

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setProgress(progressData);

        // Find first incomplete lesson
        const firstIncompleteIndex = courseData.lessons.findIndex(
          (lesson: any) => !progressData.lessonsCompleted?.includes(lesson.id)
        );
        if (firstIncompleteIndex !== -1) {
          setCurrentLessonIndex(firstIncompleteIndex);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!course || !currentLesson) return;

    try {
      setCompleting(true);
      const response = await fetch(`/api/courses/${course.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({
          lessonId: currentLesson.id
        })
      });

      if (response.ok) {
        const updatedProgress = await response.json();
        setProgress(updatedProgress);
        toast.success('Lesson completed!');

        // Move to next lesson if available
        if (currentLessonIndex < course.lessons.length - 1) {
          setCurrentLessonIndex(currentLessonIndex + 1);
        } else {
          toast.success('🎉 Congratulations! You completed the course!');
        }
      } else {
        toast.error('Failed to mark lesson as complete');
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Failed to mark lesson as complete');
    } finally {
      setCompleting(false);
    }
  };

  const isLessonUnlocked = (lesson: any) => {
    if (!lesson.dripDay) return true;
    if (!progress?.enrolledAt) return true;

    const enrollDate = new Date(progress.enrolledAt);
    const currentDate = new Date();
    const daysSinceEnrollment = Math.floor((currentDate.getTime() - enrollDate.getTime()) / (1000 * 60 * 60 * 24));

    return daysSinceEnrollment >= lesson.dripDay;
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress?.lessonsCompleted?.includes(lessonId) || false;
  };

  const handleQuizSubmit = async () => {
    if (!currentLesson?.quizData?.questions) return;

    const quiz = currentLesson.quizData;
    const questions = quiz.questions;
    let correct = 0;
    const total = questions.length;

    // Calculate score
    questions.forEach((q: any) => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / total) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    // Save quiz score to progress
    try {
      const response = await fetch(`/api/courses/${course.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          quizScore: score
        })
      });

      if (response.ok) {
        const passingScore = quiz.passingScore || 70;
        if (score >= passingScore) {
          toast.success(`Quiz passed! (${score}%)`);
        } else {
          toast.error(`Quiz score: ${score}% (Need ${passingScore}% to pass)`);
        }
      }
    } catch (error) {
      console.error('Error saving quiz score:', error);
    }
  };

  const renderQuiz = (lesson: any) => {
    if (!lesson.hasQuiz || !lesson.quizData?.questions) return null;

    const quiz = lesson.quizData;
    const questions = quiz.questions;

    return (
      <div className="bg-white rounded-2xl shadow-sm border p-8 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Quiz</h3>
          {quiz.timeLimit && (
            <span className="text-sm text-gray-600">
              Time Limit: {Math.floor(quiz.timeLimit / 60)}:{(quiz.timeLimit % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>

        {quizSubmitted && quizScore !== null ? (
          <div className={`text-center py-8 ${quizScore >= quiz.passingScore ? 'text-green-600' : 'text-red-600'}`}>
            <FiCheckCircle className={`mx-auto mb-4 ${quizScore >= quiz.passingScore ? 'text-green-500' : 'text-red-500'}`} size={48} />
            <h4 className="text-2xl font-bold mb-2">Your Score: {quizScore}%</h4>
            <p className="text-lg">
              {quizScore >= quiz.passingScore 
                ? `🎉 Congratulations! You passed! (Required: ${quiz.passingScore}%)`
                : `You need ${quiz.passingScore}% to pass. Try again!`}
            </p>
            <div className="mt-6 space-y-3">
              {questions.map((q: any, idx: number) => {
                const isCorrect = quizAnswers[q.id] === q.correctAnswer;
                return (
                  <div key={q.id} className="text-left bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-gray-900">{idx + 1}. {q.question}</span>
                      {isCorrect ? (
                        <FiCheckCircle className="text-green-600 ml-2 flex-shrink-0" />
                      ) : (
                        <FiAlertCircle className="text-red-600 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <div className="space-y-1 ml-4">
                      {q.options.map((opt: string, optIdx: number) => (
                        <div key={optIdx} className={`text-sm ${
                          optIdx === q.correctAnswer ? 'text-green-700 font-semibold' :
                          optIdx === quizAnswers[q.id] && !isCorrect ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {optIdx === q.correctAnswer ? '✓ ' : optIdx === quizAnswers[q.id] ? '✗ ' : '  '}
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {questions.map((q: any, idx: number) => (
                <div key={q.id} className="border-b border-gray-200 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {idx + 1}. {q.question}
                  </h4>
                  <div className="space-y-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <label
                        key={optIdx}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                          quizAnswers[q.id] === optIdx 
                            ? 'bg-indigo-50 border-2 border-indigo-500' 
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          checked={quizAnswers[q.id] === optIdx}
                          onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-gray-900">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length !== questions.length}
              className="w-full mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Submit Quiz
            </button>
          </>
        )}
      </div>
    );
  };

  const renderLessonContent = (lesson: any) => {
    switch (lesson.contentType) {
      case 'VIDEO':
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {lesson.videoUrl?.includes('youtube.com') || lesson.videoUrl?.includes('vimeo.com') ? (
              <iframe
                src={lesson.videoUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : lesson.videoUrl ? (
              <video
                src={lesson.videoUrl}
                controls
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                No video available
              </div>
            )}
          </div>
        );

      case 'TEXT':
        return (
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content || '' }} />
          </div>
        );

      case 'AUDIO':
        return (
          <div className="bg-gray-50 rounded-lg p-8">
            {lesson.audioUrl ? (
              <audio src={lesson.audioUrl} controls className="w-full" />
            ) : (
              <p className="text-gray-500 text-center">No audio available</p>
            )}
          </div>
        );

      case 'PDF':
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            {lesson.content ? (
              <a
                href={lesson.content}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                Download PDF
              </a>
            ) : (
              <p className="text-gray-500">No PDF available</p>
            )}
          </div>
        );

      default:
        return <p className="text-gray-500">Content type not supported</p>;
    }
  };

  // Show loading while slug is being resolved or course is loading
  if (!slug || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
        </div>
      </div>
    );
  }

  // Check if user is authenticated OR has a valid token
  const hasAccess = !!user || !!tokenEnrollment;

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <FiLock size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be enrolled or use a valid access link to view this course.</p>
          <button
            onClick={() => router.push(`/c/${slug}`)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Course Page
          </button>
        </div>
      </div>
    );
  }

  const currentLesson = course.lessons[currentLessonIndex];
  const isCurrentLessonUnlocked = isLessonUnlocked(currentLesson);
  const completedLessons = progress?.lessonsCompleted?.length || 0;
  const totalLessons = course.lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {accessToken && !user && (
        <div className="bg-yellow-100 text-yellow-800 text-center py-2 text-sm absolute top-0 left-0 right-0 z-10">
          You are viewing this course via an access link. <Link href="/handler/sign-up" className="underline">Create an account</Link> to save your progress permanently.
        </div>
      )}
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r flex-shrink-0 overflow-y-auto">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900 mb-4">{course.title}</h1>
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>{completedLessons} of {totalLessons} lessons completed</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lesson List */}
        <div className="p-4 space-y-2">
          {course.lessons.map((lesson: any, index: number) => {
            const isCompleted = isLessonCompleted(lesson.id);
            const isUnlocked = isLessonUnlocked(lesson);
            const isCurrent = index === currentLessonIndex;

            return (
              <button
                key={lesson.id}
                onClick={() => isUnlocked && setCurrentLessonIndex(index)}
                disabled={!isUnlocked}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-indigo-50 border-2 border-indigo-600'
                    : isCompleted
                    ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                    : isUnlocked
                    ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    : 'bg-gray-50 border border-gray-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                    {isCompleted ? (
                      <FiCheckCircle className="text-green-600" size={16} />
                    ) : isUnlocked ? (
                      index + 1
                    ) : (
                      <FiLock className="text-gray-400" size={14} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm mb-1">{lesson.title}</h3>
                    {lesson.videoLength && (
                      <p className="text-xs text-gray-500">{lesson.videoLength} min</p>
                    )}
                    {lesson.hasQuiz && (
                      <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        Quiz
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {isCurrentLessonUnlocked ? (
            <>
              {/* Lesson Content */}
              <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentLesson.title}</h2>
                {currentLesson.description && (
                  <p className="text-gray-600 mb-6">{currentLesson.description}</p>
                )}
                {renderLessonContent(currentLesson)}
              </div>

              {/* Quiz */}
              {renderQuiz(currentLesson)}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
                  disabled={currentLessonIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft />
                  Previous Lesson
                </button>

                <button
                  onClick={handleCompleteLesson}
                  disabled={completing || isLessonCompleted(currentLesson.id)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLessonCompleted(currentLesson.id) ? (
                    <>
                      <FiCheckCircle />
                      Completed
                    </>
                  ) : completing ? (
                    'Saving...'
                  ) : currentLessonIndex === course.lessons.length - 1 ? (
                    'Complete Course 🎉'
                  ) : (
                    <>
                      Mark Complete & Continue
                      <FiChevronRight />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
              <FiLock className="text-gray-400 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Locked</h2>
              <p className="text-gray-600">
                This lesson will unlock on day {currentLesson.dripDay} after enrollment.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}