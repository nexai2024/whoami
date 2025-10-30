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
    console.error('Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
