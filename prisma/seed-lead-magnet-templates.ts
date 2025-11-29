/**
 * Lead Magnet Template Seeding Script
 * Populates the LeadMagnetTemplate table with starter templates
 *
 * Run with: npx tsx prisma/seed-lead-magnet-templates.ts
 */

import { PrismaClient, TemplateCategory, MagnetType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting lead magnet template seeding...');

  const templates = [
    {
      name: 'Professional Ebook Template',
      description: 'A clean, professional ebook template perfect for guides, reports, and long-form content. Includes cover page, table of contents, and multiple content sections.',
      category: TemplateCategory.EBOOK,
      type: MagnetType.EBOOK,
      thumbnailUrl: '/templates/ebook-thumb.jpg',
      previewUrl: '/templates/ebook-preview.pdf',
      templateUrl: '/templates/ebook-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a comprehensive ebook about [topic] with 10-15 pages covering key concepts, actionable tips, and real-world examples.'
    },
    {
      name: 'Ultimate Checklist Template',
      description: 'A simple, scannable checklist template ideal for step-by-step processes, task lists, and quick reference guides.',
      category: TemplateCategory.CHECKLIST,
      type: MagnetType.CHECKLIST,
      thumbnailUrl: '/templates/checklist-thumb.jpg',
      previewUrl: '/templates/checklist-preview.pdf',
      templateUrl: '/templates/checklist-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a checklist for [topic] with 10-20 actionable items organized into logical sections with checkboxes.'
    },
    {
      name: 'Quick Start Guide Template',
      description: 'A beginner-friendly guide template for tutorials, onboarding materials, and how-to content. Perfect for breaking down complex topics.',
      category: TemplateCategory.GUIDE,
      type: MagnetType.PDF,
      thumbnailUrl: '/templates/guide-thumb.jpg',
      previewUrl: '/templates/guide-preview.pdf',
      templateUrl: '/templates/guide-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a quick start guide for [topic] covering the basics in 5-7 easy steps with visuals and examples.'
    },
    // Course & Content Creator Templates
    {
      name: 'Course Outline Template',
      description: 'A comprehensive course structure template to help you plan, organize, and map out your course content. Includes modules, lessons, learning objectives, and assessment sections.',
      category: TemplateCategory.PLANNER,
      type: MagnetType.WORKBOOK,
      thumbnailUrl: '/templates/course-outline-thumb.jpg',
      previewUrl: '/templates/course-outline-preview.pdf',
      templateUrl: '/templates/course-outline-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a course outline for [topic] with 5-8 modules, each containing 3-5 lessons with clear learning objectives and action items.'
    },
    {
      name: 'Content Calendar Planner',
      description: 'A monthly and weekly content planning template for social media, blog posts, videos, and email campaigns. Includes content themes, posting schedules, and engagement tracking.',
      category: TemplateCategory.PLANNER,
      type: MagnetType.SPREADSHEET,
      thumbnailUrl: '/templates/content-calendar-thumb.jpg',
      previewUrl: '/templates/content-calendar-preview.pdf',
      templateUrl: '/templates/content-calendar-template.xlsx',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a 30-day content calendar for [platform/topic] with daily post ideas, themes, and engagement goals.'
    },
    {
      name: 'Video Script Template',
      description: 'A professional video script template for YouTube, course videos, and social media content. Includes hooks, main content sections, calls-to-action, and timing notes.',
      category: TemplateCategory.SWIPE_FILE,
      type: MagnetType.TEMPLATE,
      thumbnailUrl: '/templates/video-script-thumb.jpg',
      previewUrl: '/templates/video-script-preview.pdf',
      templateUrl: '/templates/video-script-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a video script template for [video type] with hook, main content sections, transitions, and call-to-action.'
    },
    {
      name: 'Course Launch Checklist',
      description: 'A complete pre-launch checklist for course creators covering content creation, marketing, technical setup, pricing, and student onboarding. Never miss a launch step again.',
      category: TemplateCategory.CHECKLIST,
      type: MagnetType.CHECKLIST,
      thumbnailUrl: '/templates/course-launch-thumb.jpg',
      previewUrl: '/templates/course-launch-preview.pdf',
      templateUrl: '/templates/course-launch-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a comprehensive course launch checklist with 50+ actionable items organized by phase: pre-launch, launch week, and post-launch.'
    },
    {
      name: 'Content Repurposing Guide',
      description: 'A strategic guide showing how to repurpose one piece of content into 10+ formats. Includes templates for blog-to-video, video-to-blog, podcast-to-social, and more.',
      category: TemplateCategory.GUIDE,
      type: MagnetType.PDF,
      thumbnailUrl: '/templates/content-repurpose-thumb.jpg',
      previewUrl: '/templates/content-repurpose-preview.pdf',
      templateUrl: '/templates/content-repurpose-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a content repurposing guide showing how to transform [content type] into multiple formats across different platforms.'
    },
    {
      name: 'Student Onboarding Workbook',
      description: 'A comprehensive onboarding workbook template to welcome new students, set expectations, and guide them through their learning journey. Includes welcome messages, goal setting, and progress tracking.',
      category: TemplateCategory.WORKBOOK,
      type: MagnetType.WORKBOOK,
      thumbnailUrl: '/templates/student-onboarding-thumb.jpg',
      previewUrl: '/templates/student-onboarding-preview.pdf',
      templateUrl: '/templates/student-onboarding-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a student onboarding workbook with welcome content, goal-setting exercises, course navigation guide, and progress tracking sheets.'
    },
    {
      name: 'Content Idea Generator',
      description: 'A brainstorming template with 100+ content ideas, prompts, and frameworks to help you never run out of content. Includes seasonal content ideas, trending topics, and evergreen formats.',
      category: TemplateCategory.RESOURCE_LIST,
      type: MagnetType.PDF,
      thumbnailUrl: '/templates/content-ideas-thumb.jpg',
      previewUrl: '/templates/content-ideas-preview.pdf',
      templateUrl: '/templates/content-ideas-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a content idea generator with 100+ prompts, frameworks, and templates for [niche/topic] across different content formats.'
    },
    {
      name: 'Course Pricing Calculator',
      description: 'An interactive spreadsheet template to calculate optimal course pricing based on your costs, time investment, target audience, and market positioning. Includes ROI calculations and competitor analysis.',
      category: TemplateCategory.PLANNER,
      type: MagnetType.SPREADSHEET,
      thumbnailUrl: '/templates/pricing-calculator-thumb.jpg',
      previewUrl: '/templates/pricing-calculator-preview.pdf',
      templateUrl: '/templates/pricing-calculator-template.xlsx',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a course pricing calculator spreadsheet with cost analysis, time investment tracking, market comparison, and ROI projections.'
    },
    {
      name: 'Content Performance Tracker',
      description: 'A comprehensive analytics tracker for monitoring content performance across platforms. Track views, engagement, conversions, and ROI for blog posts, videos, social media, and email campaigns.',
      category: TemplateCategory.TRACKER,
      type: MagnetType.SPREADSHEET,
      thumbnailUrl: '/templates/content-tracker-thumb.jpg',
      previewUrl: '/templates/content-tracker-preview.pdf',
      templateUrl: '/templates/content-tracker-template.xlsx',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a content performance tracker with metrics for views, engagement, conversions, and ROI across multiple platforms and content types.'
    },
    {
      name: 'Course Module Planner',
      description: 'A detailed module planning template for structuring individual course modules. Includes lesson breakdowns, learning objectives, activities, resources, and assessment criteria.',
      category: TemplateCategory.PLANNER,
      type: MagnetType.WORKBOOK,
      thumbnailUrl: '/templates/module-planner-thumb.jpg',
      previewUrl: '/templates/module-planner-preview.pdf',
      templateUrl: '/templates/module-planner-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a course module planner template with sections for learning objectives, lesson breakdown, activities, resources, and assessments.'
    },
    {
      name: 'Email Sequence Template for Course Launches',
      description: 'A proven email sequence template for course launches covering pre-launch, launch, and post-launch phases. Includes subject lines, copy templates, and timing recommendations.',
      category: TemplateCategory.SWIPE_FILE,
      type: MagnetType.TEMPLATE,
      thumbnailUrl: '/templates/email-sequence-thumb.jpg',
      previewUrl: '/templates/email-sequence-preview.pdf',
      templateUrl: '/templates/email-sequence-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create an email sequence template for course launches with 10-15 emails covering pre-launch, launch week, and post-launch follow-ups.'
    },
    {
      name: 'Social Media Content Planner',
      description: 'A comprehensive social media planning template with content pillars, post formats, caption templates, and hashtag strategies. Perfect for Instagram, TikTok, LinkedIn, and more.',
      category: TemplateCategory.PLANNER,
      type: MagnetType.WORKBOOK,
      thumbnailUrl: '/templates/social-planner-thumb.jpg',
      previewUrl: '/templates/social-planner-preview.pdf',
      templateUrl: '/templates/social-planner-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a social media content planner with content pillars, post format ideas, caption templates, and hashtag strategies for [platform].'
    },
    {
      name: 'Content Creator Cheat Sheet',
      description: 'A quick-reference cheat sheet with best practices, formulas, and frameworks for creating high-performing content. Includes hooks, storytelling structures, and engagement tactics.',
      category: TemplateCategory.CHEAT_SHEET,
      type: MagnetType.PDF,
      thumbnailUrl: '/templates/content-cheat-sheet-thumb.jpg',
      previewUrl: '/templates/content-cheat-sheet-preview.pdf',
      templateUrl: '/templates/content-cheat-sheet-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a content creator cheat sheet with proven formulas, hooks, storytelling frameworks, and engagement tactics for [content type].'
    }
  ];

  // Insert templates
  for (const template of templates) {
    try {
      const created = await prisma.leadMagnetTemplate.create({
        data: template
      });
      console.log(`✓ Created template: ${created.name}`);
    } catch (error) {
      console.error(`✗ Failed to create template "${template.name}":`, error);
    }
  }

  console.log('\nSeeding complete!');
  console.log('Note: Template URLs are placeholders. Upload actual template files to R2 and update URLs in database.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
