/**
 * Unified Seed Script
 * Combines all seeding operations into one comprehensive script
 * 
 * Seeds:
 * - Features, Plans, and Plan Features
 * - 25 Bio Templates (BIO_ONLY)
 * - 75 Full Page Templates (FULL_PAGE)
 * - 15 Other Templates (Lead Magnets, Campaigns, etc)
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient, TemplateCategory, MagnetType, TemplateType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Create Prisma client with adapter (required for Prisma 7)
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function upsertPlanFeature(
  planId: string,
  featureId: string,
  data: { limit: number | null; enabled: boolean }
) {
  await prisma.planFeature.upsert({
    where: {
      planId_featureId: {
        planId,
        featureId,
      },
    },
    update: {
      limit: data.limit,
      enabled: data.enabled,
    },
    create: {
      planId,
      featureId,
      limit: data.limit,
      enabled: data.enabled,
    },
  });
}

async function truncateTable(tableName: string) {
  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
    console.log(`  ✓ Truncated ${tableName}`);
  } catch (error: any) {
    // Ignore "table does not exist" errors (expected on first run)
    if (error?.meta?.driverAdapterError?.cause?.code === '42P01' || 
        error?.code === 'P2010') {
      console.log(`  ⚠ Table "${tableName}" does not exist yet (will be created)`);
    } else {
      console.error(`  ✗ Error truncating ${tableName}:`, error);
    }
  }
}

// ============================================
// SEED FEATURES, PLANS, AND PLAN FEATURES
// ============================================

async function seedFeaturesAndPlans() {
  console.log('\n📋 Seeding Features and Plans...');

  // 1. Create Features
  console.log('Creating features...');
  
  const features = [
    { name: 'pages', description: 'Number of pages', type: 'quota' },
    { name: 'storage_gb', description: 'Storage in GB', type: 'quota' },
    { name: 'custom_domains', description: 'Custom domain connections', type: 'quota' },
    { name: 'subdomains', description: 'Subdomain connections', type: 'quota' },
    { name: 'analytics', description: 'Analytics features', type: 'boolean' },
    { name: 'remove_branding', description: 'Remove WhoAmI branding', type: 'boolean' },
    { name: 'email_capture', description: 'Email capture forms', type: 'boolean' },
    { name: 'digital_products', description: 'Digital product sales', type: 'boolean' },
    { name: 'gated_content', description: 'Gated content blocks', type: 'boolean' },
    { name: 'ab_testing', description: 'A/B testing tools', type: 'boolean' },
    { name: 'api_access', description: 'API access', type: 'boolean' },
    { name: 'team_members', description: 'Team member access', type: 'quota' },
    { name: 'priority_support', description: 'Priority support', type: 'boolean' },
    { name: 'white_label', description: 'White-label options', type: 'boolean' },
  ];

  const createdFeatures: Record<string, { id: string; name: string }> = {};

  for (const feature of features) {
    const existing = await prisma.feature.findUnique({
      where: { name: feature.name },
    });

    if (existing) {
      createdFeatures[feature.name] = existing;
      console.log(`  ✓ Feature "${feature.name}" already exists`);
    } else {
      const created = await prisma.feature.create({
        data: feature,
      });
      createdFeatures[feature.name] = created;
      console.log(`  ✓ Created feature "${feature.name}"`);
    }
  }

  // 2. Create Plans
  console.log('\nCreating plans...');

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      planEnum: 'FREE',
      price: 0,
      interval: 'month',
      isActive: true,
    },
    {
      name: 'Creator',
      description: 'For content creators ready to grow',
      planEnum: 'CREATOR',
      price: 5,
      interval: 'month',
      isActive: true,
    },
    {
      name: 'Pro',
      description: 'For professionals maximizing revenue',
      planEnum: 'PRO',
      price: 10,
      interval: 'month',
      isActive: true,
    },
    {
      name: 'Business',
      description: 'For teams and agencies',
      planEnum: 'BUSINESS',
      price: 25,
      interval: 'month',
      isActive: true,
    },
  ];

  const createdPlans: Record<string, { id: string; planEnum: string }> = {};

  for (const planData of plans) {
    const existing = await prisma.plan.findUnique({
      where: { name: planData.name },
    });

    if (existing) {
      createdPlans[planData.planEnum] = existing;
      console.log(`  ✓ Plan "${planData.name}" already exists`);
    } else {
      const created = await prisma.plan.create({
        data: {
          ...planData,
          planEnum: planData.planEnum as any,
        },
      });
      createdPlans[planData.planEnum] = created;
      console.log(`  ✓ Created plan "${planData.name}"`);
    }
  }

  // 3. Link Features to Plans
  console.log('\nLinking features to plans...');

  // FREE Plan Features
  const freePlanFeatures = [
    { feature: 'pages', limit: 1, enabled: true },
    { feature: 'storage_gb', limit: .5, enabled: true },
    { feature: 'custom_domains', limit: 0, enabled: false },
    { feature: 'subdomains', limit: 1, enabled: false },
    { feature: 'analytics', limit: null, enabled: true },
    { feature: 'remove_branding', limit: null, enabled: false },
    { feature: 'email_capture', limit: null, enabled: false },
    { feature: 'digital_products', limit: null, enabled: false },
    { feature: 'gated_content', limit: null, enabled: false },
    { feature: 'ab_testing', limit: null, enabled: false },
    { feature: 'api_access', limit: null, enabled: false },
    { feature: 'team_members', limit: 1, enabled: true },
    { feature: 'priority_support', limit: null, enabled: false },
    { feature: 'white_label', limit: null, enabled: false },
  ];

  for (const pf of freePlanFeatures) {
    await upsertPlanFeature(createdPlans['FREE'].id, createdFeatures[pf.feature].id, {
      limit: pf.limit,
      enabled: pf.enabled,
    });
  }
  console.log(`  ✓ Linked ${freePlanFeatures.length} features to FREE plan`);

  // CREATOR Plan Features
  const creatorPlanFeatures = [
    { feature: 'pages', limit: null, enabled: true },
    { feature: 'storage_gb', limit: 10, enabled: true },
    { feature: 'custom_domains', limit: 1, enabled: true },
    { feature: 'subdomains', limit: 1, enabled: true },
    { feature: 'analytics', limit: null, enabled: true },
    { feature: 'remove_branding', limit: null, enabled: true },
    { feature: 'email_capture', limit: null, enabled: true },
    { feature: 'digital_products', limit: null, enabled: false },
    { feature: 'gated_content', limit: null, enabled: false },
    { feature: 'ab_testing', limit: null, enabled: false },
    { feature: 'api_access', limit: null, enabled: false },
    { feature: 'team_members', limit: 1, enabled: true },
    { feature: 'priority_support', limit: null, enabled: true },
    { feature: 'white_label', limit: null, enabled: false },
  ];

  for (const pf of creatorPlanFeatures) {
    await upsertPlanFeature(createdPlans['CREATOR'].id, createdFeatures[pf.feature].id, {
      limit: pf.limit,
      enabled: pf.enabled,
    });
  }
  console.log(`  ✓ Linked ${creatorPlanFeatures.length} features to CREATOR plan`);

  // PRO Plan Features
  const proPlanFeatures = [
    { feature: 'pages', limit: null, enabled: true },
    { feature: 'storage_gb', limit: 50, enabled: true },
    { feature: 'custom_domains', limit: 3, enabled: true },
    { feature: 'subdomains', limit: 5, enabled: true },
    { feature: 'analytics', limit: null, enabled: true },
    { feature: 'remove_branding', limit: null, enabled: true },
    { feature: 'email_capture', limit: null, enabled: true },
    { feature: 'digital_products', limit: null, enabled: true },
    { feature: 'gated_content', limit: null, enabled: true },
    { feature: 'ab_testing', limit: null, enabled: true },
    { feature: 'api_access', limit: null, enabled: false },
    { feature: 'team_members', limit: 2, enabled: true },
    { feature: 'priority_support', limit: null, enabled: true },
    { feature: 'white_label', limit: null, enabled: false },
  ];

  for (const pf of proPlanFeatures) {
    await upsertPlanFeature(createdPlans['PRO'].id, createdFeatures[pf.feature].id, {
      limit: pf.limit,
      enabled: pf.enabled,
    });
  }
  console.log(`  ✓ Linked ${proPlanFeatures.length} features to PRO plan`);

  // BUSINESS Plan Features
  const businessPlanFeatures = [
    { feature: 'pages', limit: null, enabled: true },
    { feature: 'storage_gb', limit: null, enabled: true },
    { feature: 'custom_domains', limit: null, enabled: true },
    { feature: 'subdomains', limit: null, enabled: true },
    { feature: 'analytics', limit: null, enabled: true },
    { feature: 'remove_branding', limit: null, enabled: true },
    { feature: 'email_capture', limit: null, enabled: true },
    { feature: 'digital_products', limit: null, enabled: true },
    { feature: 'gated_content', limit: null, enabled: true },
    { feature: 'ab_testing', limit: null, enabled: true },
    { feature: 'api_access', limit: null, enabled: true },
    { feature: 'team_members', limit: 5, enabled: true },
    { feature: 'priority_support', limit: null, enabled: true },
    { feature: 'white_label', limit: null, enabled: true },
  ];

  for (const pf of businessPlanFeatures) {
    await upsertPlanFeature(createdPlans['BUSINESS'].id, createdFeatures[pf.feature].id, {
      limit: pf.limit,
      enabled: pf.enabled,
    });
  }
  console.log(`  ✓ Linked ${businessPlanFeatures.length} features to BUSINESS plan`);
}

// ============================================
// BIO TEMPLATES (25 templates)
// ============================================

function generateBioTemplates() {
  const bioVariations = [
    { style: 'Personal Brand', persona: 'Alex Morgan', title: 'Content Creator & Digital Nomad', location: 'Bali, Indonesia', headerStyle: 'gradient' },
    { style: 'Business Professional', persona: 'Jennifer Chen', title: 'Chief Technology Officer', company: 'TechVision Inc.', location: 'San Francisco, CA', headerStyle: 'card' },
    { style: 'Minimalist Profile', persona: 'David Park', title: 'Writer', location: 'Seattle', headerStyle: 'minimal' },
    { style: 'Creative Professional', persona: 'Maya Rodriguez', title: 'Visual Designer & Art Director', location: 'Brooklyn, NY', headerStyle: 'split' },
    { style: 'Tech Executive', persona: 'Sarah Kim', title: 'VP of Engineering', company: 'CloudScale', location: 'Seattle, WA', headerStyle: 'card' },
    { style: 'Artist Portfolio', persona: 'Luna Martinez', title: 'Digital Artist & Illustrator', location: 'Portland, OR', headerStyle: 'gradient' },
    { style: 'Consultant', persona: 'Michael Chen', title: 'Strategy Consultant', company: 'Independent', location: 'New York, NY', headerStyle: 'minimal' },
    { style: 'Entrepreneur', persona: 'Jordan Taylor', title: 'Founder & CEO', company: 'Innovate Labs', location: 'Austin, TX', headerStyle: 'card' },
    { style: 'Educator', persona: 'Dr. Emily Watson', title: 'Professor of Design', company: 'Design Institute', location: 'Boston, MA', headerStyle: 'split' },
    { style: 'Photographer', persona: 'Nova Ellis', title: 'Brand + Editorial Photographer', location: 'Los Angeles, CA', headerStyle: 'gradient' },
    { style: 'Musician', persona: 'River Stone', title: 'Electronic Music Producer', location: 'Berlin, Germany', headerStyle: 'minimal' },
    { style: 'Writer', persona: 'Quinn Harper', title: 'Author & Researcher', location: 'London, UK', headerStyle: 'card' },
    { style: 'Coach', persona: 'Jordan Blake', title: 'Executive Leadership Coach', company: 'Elevate Performance', location: 'Austin, TX', headerStyle: 'card' },
    { style: 'Speaker', persona: 'Leo Martinez', title: 'Keynote Speaker & Moderator', location: 'Miami, FL', headerStyle: 'split' },
    { style: 'Fitness Coach', persona: 'Chris Taylor', title: 'Fitness Coach & Wellness Expert', location: 'Los Angeles, CA', headerStyle: 'minimal' },
    { style: 'Food Creator', persona: 'Lena Hearts Food', title: 'Chef & Storyteller', location: 'Portland, OR', headerStyle: 'gradient' },
    { style: 'Travel Creator', persona: 'Atlas & Aria', title: 'Slow Travel Storytellers', location: 'Worldwide', headerStyle: 'minimal' },
    { style: 'Beauty Creator', persona: 'Muse Lab Beauty', title: 'Indie Beauty Brand Founder', location: 'Los Angeles, CA', headerStyle: 'card' },
    { style: 'Finance Educator', persona: 'Morgan True', title: 'Financial Educator & Analyst', location: 'Chicago, IL', headerStyle: 'card' },
    { style: 'Tech Educator', persona: 'Devon Cade', title: 'Engineer & Educator', location: 'San Francisco, CA', headerStyle: 'split' },
    { style: 'Wellness Practitioner', persona: 'Selene Hart', title: 'Founder, Wild Bloom Retreats', company: 'Wild Bloom', location: 'Sedona, AZ', headerStyle: 'gradient' },
    { style: 'Yoga Instructor', persona: 'Luma Yoga', title: 'Boutique Yoga Studio Owner', location: 'Boulder, CO', headerStyle: 'minimal' },
    { style: 'Podcast Host', persona: 'Nyla Brooks', title: 'Host, The Signal Podcast', company: 'Signal Media', location: 'New York, NY', headerStyle: 'card' },
    { style: 'Streamer', persona: 'Atlas Rae', title: 'Tech & Variety Streamer', location: 'Remote', headerStyle: 'gradient' },
    { style: 'Agency Founder', persona: 'Summit North Agency', title: 'Performance Studio for B2B SaaS', location: 'Remote • Global', headerStyle: 'split' },
  ];

  return bioVariations.map((variation, index) => ({
    name: `${variation.style} Bio`,
    description: `Professional ${variation.style.toLowerCase()} bio template perfect for ${variation.persona.split(' ')[0]}'s personal brand`,
    category: 'Bio',
    templateType: TemplateType.BIO_ONLY,
    tags: [variation.style.toLowerCase().replace(/\s+/g, '-'), 'bio', 'professional'],
    featured: index < 5,
    isPublic: true,
    thumbnailUrl: `/templates/bio-${variation.style.toLowerCase().replace(/\s+/g, '-')}.png`,
    headerData: {
      displayName: variation.persona,
      title: variation.title,
      company: variation.company || '',
      bio: `Professional ${variation.style.toLowerCase()} with expertise in their field. Building a personal brand and connecting with their audience.`,
      email: '',
      phone: '',
      website: '',
      location: variation.location,
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: '',
        instagram: '',
        youtube: '',
        tiktok: '',
        linkedin: '',
        facebook: '',
        github: ''
      },
      customIntroduction: '',
      headerStyle: variation.headerStyle
    },
    blocksData: []
  }));
}

// ============================================
// FULL PAGE TEMPLATES (75 templates)
// ============================================

function generateFullPageTemplates() {
  // Base templates from seed-templates.ts (15 templates)
  const baseTemplates = [
    {
      name: "Creative Portfolio",
      description: "Showcase your creative work with stunning galleries and project displays",
      category: "Portfolio",
      tags: ["portfolio", "creative", "designer", "artist"],
      featured: true,
    },
    {
      name: "Link in Bio Pro",
      description: "Perfect for social media - showcase all your important links in one place",
      category: "Link-in-Bio",
      tags: ["linkinbio", "social", "simple", "essential"],
      featured: true,
    },
    {
      name: "Product Launch",
      description: "Launch your product with style - perfect for courses, ebooks, and digital products",
      category: "Product Launch",
      tags: ["product", "launch", "sales", "ecommerce"],
      featured: true,
    },
    {
      name: "Course Creator Hub",
      description: "Perfect for educators and course creators showcasing online programs",
      category: "Course Creator",
      tags: ["education", "courses", "teaching", "learning"],
      featured: true,
    },
    {
      name: "Event Landing Page",
      description: "Promote your event, workshop, or webinar with this conversion-focused template",
      category: "Event Landing",
      tags: ["event", "workshop", "webinar", "conference"],
      featured: true,
    },
    {
      name: "Service Business",
      description: "Perfect for consultants, agencies, and service providers",
      category: "Service Business",
      tags: ["business", "consulting", "agency", "services"],
      featured: true,
    },
    {
      name: "Newsletter Signup",
      description: "Grow your email list with this focused lead generation page",
      category: "Newsletter Signup",
      tags: ["newsletter", "email", "lead-gen", "subscribe"],
      featured: true,
    },
    {
      name: "Creator Media Kit",
      description: "Pitch brands with a polished media kit that highlights reach, audience insights, and sponsorship offers",
      category: "Creators/Influencers",
      tags: ["creator", "influencer", "media-kit", "sponsors"],
      featured: true,
    },
    {
      name: "Coach Authority Hub",
      description: "Convert leads with a high-trust coaching page featuring signature frameworks, testimonials, and booking CTA",
      category: "Coaches",
      tags: ["coach", "consultant", "booking", "authority"],
      featured: true,
    },
    {
      name: "Course Launch Blueprint",
      description: "High-converting launch page for cohort-based courses with curriculum breakdown and bonuses",
      category: "Course Creator",
      tags: ["courses", "launch", "education", "cohort"],
      featured: true,
    },
    {
      name: "Vlogger Episode Hub",
      description: "Create a destination for binge-worthy video content with playlists, partners, and merch links",
      category: "Content Creators",
      tags: ["vlog", "video", "youtube", "creator"],
      featured: true,
    },
    {
      name: "Creator Newsletter Hub",
      description: "Invite fans to subscribe, binge premium content, and discover signature products in one destination",
      category: "Creators/Influencers",
      tags: ["newsletter", "creator", "community", "monetization"],
      featured: true,
    },
    {
      name: "Creator Launchpad",
      description: "Position your social channels, offers, and collaborations from a single conversion hub",
      category: "Creators/Influencers",
      tags: ["creator", "systems", "ops"],
      featured: false,
    },
    {
      name: "Creator Monetization Hub",
      description: "Highlight premium products, exclusive drops, and partner links in one streamlined view",
      category: "Creators/Influencers",
      tags: ["monetization", "community", "collab"],
      featured: false,
    },
    {
      name: "Daily Vlog Portal",
      description: "Centralize your latest uploads, playlists, and merch for binge-ready fans",
      category: "Creators/Influencers",
      tags: ["vlog", "travel", "cinematic"],
      featured: false,
    },
  ];

  // Generate 60 more unique full page templates
  const additionalTemplates = [];
  const categories = [
    'Portfolio', 'Link-in-Bio', 'Product Launch', 'Course Creator', 'Event Landing',
    'Service Business', 'Newsletter Signup', 'Creators/Influencers', 'Coaches',
    'Entrepreneurs', 'Business/Professional', 'Artists/Creatives', 'Events/Organizations',
    'Specialty', 'Content Creators'
  ];

  const industries = [
    'Content Creator', 'Influencer', 'Vlogger', 'Streaming', 'Podcast Host',
    'Course Creator', 'Coach/Mentor', 'SaaS Founder', 'Agency', 'Freelance',
    'Speaker', 'Author', 'Non-profit', 'Community', 'Photographer', 'Musician',
    'Artist', 'Digital Products', 'Marketing', 'Conference', 'Food Blogger',
    'Travel Creator', 'Beauty Creator', 'Finance Educator', 'Tech Educator',
    'Wellness', 'Yoga', 'Fitness'
  ];

  const templateThemes = [
    'Modern', 'Minimal', 'Bold', 'Elegant', 'Vibrant', 'Professional',
    'Creative', 'Playful', 'Sophisticated', 'Clean', 'Dynamic', 'Classic'
  ];

  for (let i = 0; i < 60; i++) {
    const category = categories[i % categories.length];
    const industry = industries[i % industries.length];
    const theme = templateThemes[i % templateThemes.length];
    const templateNum = i + 1;

    additionalTemplates.push({
      name: `${theme} ${category} ${templateNum}`,
      description: `A ${theme.toLowerCase()} ${category.toLowerCase()} template perfect for ${industry.toLowerCase()} professionals`,
      category,
      industry,
      tags: [category.toLowerCase().replace(/\s+/g, '-'), industry.toLowerCase().replace(/\s+/g, '-'), theme.toLowerCase(), 'template'],
      featured: i < 10,
    });
  }

  // Combine base and additional templates
  const allTemplates = [...baseTemplates, ...additionalTemplates];

  return allTemplates.map((template, index) => ({
    name: template.name,
    description: template.description,
    category: template.category,
    industry: template.industry || null,
    templateType: TemplateType.FULL_PAGE,
    tags: template.tags,
    featured: template.featured,
    isPublic: true,
    thumbnailUrl: `/templates/${template.name.toLowerCase().replace(/\s+/g, '-')}.png`,
    headerData: {
      displayName: '',
      title: template.name,
      company: '',
      bio: template.description,
      email: '',
      phone: '',
      website: '',
      location: '',
      avatar: null,
      backgroundImage: null,
      socialLinks: {
        twitter: '',
        instagram: '',
        youtube: '',
        tiktok: '',
        linkedin: '',
        facebook: '',
        github: ''
      },
      customIntroduction: '',
      headerStyle: index % 4 === 0 ? 'gradient' : index % 4 === 1 ? 'card' : index % 4 === 2 ? 'split' : 'minimal'
    },
    blocksData: [
      {
        type: 'TEXT_BLOCK',
        position: 0,
        title: 'Welcome',
        description: null,
        url: null,
        imageUrl: null,
        backgroundColor: '#ffffff',
        textColor: '#111827',
        borderRadius: 12,
        data: {
          content: `This is a ${template.name} template. Customize it to match your brand and goals.`,
          alignment: 'center'
        }
      }
    ]
  }));
}

// ============================================
// OTHER TEMPLATES (15 templates - Lead Magnets, Campaigns, etc)
// ============================================

function generateOtherTemplates() {
  return [
    {
      name: 'Professional Ebook Template',
      description: 'A clean, professional ebook template perfect for guides, reports, and long-form content',
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
      description: 'A simple, scannable checklist template ideal for step-by-step processes, task lists, and quick reference guides',
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
      description: 'A beginner-friendly guide template for tutorials, onboarding materials, and how-to content',
      category: TemplateCategory.GUIDE,
      type: MagnetType.PDF,
      thumbnailUrl: '/templates/guide-thumb.jpg',
      previewUrl: '/templates/guide-preview.pdf',
      templateUrl: '/templates/guide-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a quick start guide for [topic] covering the basics in 5-7 easy steps with visuals and examples.'
    },
    {
      name: 'Course Outline Template',
      description: 'A comprehensive course structure template to help you plan, organize, and map out your course content',
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
      description: 'A monthly and weekly content planning template for social media, blog posts, videos, and email campaigns',
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
      description: 'A professional video script template for YouTube, course videos, and social media content',
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
      description: 'A complete pre-launch checklist for course creators covering content creation, marketing, technical setup, pricing, and student onboarding',
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
      description: 'A strategic guide showing how to repurpose one piece of content into 10+ formats',
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
      description: 'A comprehensive onboarding workbook template to welcome new students, set expectations, and guide them through their learning journey',
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
      description: 'A brainstorming template with 100+ content ideas, prompts, and frameworks to help you never run out of content',
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
      description: 'An interactive spreadsheet template to calculate optimal course pricing based on your costs, time investment, target audience, and market positioning',
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
      description: 'A comprehensive analytics tracker for monitoring content performance across platforms',
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
      description: 'A detailed module planning template for structuring individual course modules',
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
      description: 'A proven email sequence template for course launches covering pre-launch, launch, and post-launch phases',
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
      description: 'A comprehensive social media planning template with content pillars, post formats, caption templates, and hashtag strategies',
      category: TemplateCategory.PLANNER,
      type: MagnetType.WORKBOOK,
      thumbnailUrl: '/templates/social-planner-thumb.jpg',
      previewUrl: '/templates/social-planner-preview.pdf',
      templateUrl: '/templates/social-planner-template.pdf',
      featured: true,
      useCount: 0,
      samplePrompt: 'Create a social media content planner with content pillars, post format ideas, caption templates, and hashtag strategies for [platform].'
    },
  ];
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  try {
    // 1. Seed Features and Plans
    await seedFeaturesAndPlans();

    // 2. Clear existing templates (optional - comment out if you want to keep existing)
    console.log('\n🗑️  Clearing existing templates...');
    await truncateTable('page_template');
    await truncateTable('lead_magnet_template');

    // 3. Seed Bio Templates (25)
    console.log('\n👤 Seeding Bio Templates...');
    const bioTemplates = generateBioTemplates();
    for (const template of bioTemplates) {
      await prisma.pageTemplate.create({
        data: {
          ...template,
          userId: null
        }
      });
    }
    console.log(`  ✓ Created ${bioTemplates.length} bio templates`);

    // 4. Seed Full Page Templates (75)
    console.log('\n📄 Seeding Full Page Templates...');
    const fullPageTemplates = generateFullPageTemplates();
    // Deduplicate by name
    const uniqueFullPageTemplates = Array.from(
      new Map(fullPageTemplates.map(t => [t.name, t])).values()
    );
    
    // Ensure we have exactly 75
    while (uniqueFullPageTemplates.length < 75) {
      const additional = generateFullPageTemplates();
      for (const template of additional) {
        if (!uniqueFullPageTemplates.find(t => t.name === template.name)) {
          uniqueFullPageTemplates.push(template);
          if (uniqueFullPageTemplates.length >= 75) break;
        }
      }
    }

    for (const template of uniqueFullPageTemplates.slice(0, 75)) {
      await prisma.pageTemplate.create({
        data: {
          ...template,
          userId: null
        }
      });
    }
    console.log(`  ✓ Created ${Math.min(75, uniqueFullPageTemplates.length)} full page templates`);

    // 5. Seed Other Templates (15 - Lead Magnets)
    console.log('\n📎 Seeding Other Templates (Lead Magnets)...');
    const otherTemplates = generateOtherTemplates();
    // Deduplicate by name
    const uniqueOtherTemplates = Array.from(
      new Map(otherTemplates.map(t => [t.name, t])).values()
    );

    for (const template of uniqueOtherTemplates.slice(0, 15)) {
      await prisma.leadMagnetTemplate.create({
        data: template
      });
    }
    console.log(`  ✓ Created ${Math.min(15, uniqueOtherTemplates.length)} other templates`);

    // Summary
    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${bioTemplates.length} Bio Templates`);
    console.log(`   - ${Math.min(75, uniqueFullPageTemplates.length)} Full Page Templates`);
    console.log(`   - ${Math.min(15, uniqueOtherTemplates.length)} Other Templates (Lead Magnets)`);
    console.log(`   - Total: ${bioTemplates.length + Math.min(75, uniqueFullPageTemplates.length) + Math.min(15, uniqueOtherTemplates.length)} templates`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
