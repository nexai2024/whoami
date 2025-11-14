/**
 * Generate Template Thumbnail Images
 * Creates PNG images for all page templates
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const WIDTH = 1200;
const HEIGHT = 675;
const OUTPUT_DIR = join(process.cwd(), 'public', 'templates');

// Template configurations with colors and icons
const templates = [
  {
    filename: 'personal-brand.png',
    name: 'Personal Brand',
    category: 'Bio',
    gradient: ['#667eea', '#764ba2'],
    icon: '👤',
  },
  {
    filename: 'business-professional.png',
    name: 'Business Professional',
    category: 'Bio',
    gradient: ['#1e3a8a', '#3b82f6'],
    icon: '💼',
  },
  {
    filename: 'creative-portfolio.png',
    name: 'Creative Portfolio',
    category: 'Portfolio',
    gradient: ['#f093fb', '#f5576c'],
    icon: '🎨',
  },
  {
    filename: 'link-in-bio.png',
    name: 'Link in Bio Pro',
    category: 'Link-in-Bio',
    gradient: ['#4facfe', '#00f2fe'],
    icon: '🔗',
  },
  {
    filename: 'product-launch.png',
    name: 'Product Launch',
    category: 'Product Launch',
    gradient: ['#fa709a', '#fee140'],
    icon: '🚀',
  },
  {
    filename: 'course-creator.png',
    name: 'Course Creator Hub',
    category: 'Course Creator',
    gradient: ['#30cfd0', '#330867'],
    icon: '📚',
  },
  {
    filename: 'minimalist-profile.png',
    name: 'Minimalist Profile',
    category: 'Minimalist',
    gradient: ['#a8edea', '#fed6e3'],
    icon: '✨',
  },
  {
    filename: 'event-landing.png',
    name: 'Event Landing Page',
    category: 'Event Landing',
    gradient: ['#ff9a9e', '#fecfef'],
    icon: '📅',
  },
  {
    filename: 'service-business.png',
    name: 'Service Business',
    category: 'Service Business',
    gradient: ['#a18cd1', '#fbc2eb'],
    icon: '🏢',
  },
  {
    filename: 'newsletter-signup.png',
    name: 'Newsletter Signup',
    category: 'Newsletter Signup',
    gradient: ['#ffecd2', '#fcb69f'],
    icon: '📧',
  },
];

// Create SVG for template thumbnail
function createTemplateSVG(template: typeof templates[0]): string {
  const [color1, color2] = template.gradient;
  
  return `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grad)"/>
  
  <!-- Pattern overlay -->
  <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.1)"/>
  <circle cx="${WIDTH - 100}" cy="${HEIGHT - 100}" r="120" fill="rgba(255,255,255,0.1)"/>
  <circle cx="${WIDTH / 2}" cy="${HEIGHT / 2}" r="150" fill="rgba(255,255,255,0.05)"/>
  
  <!-- Content Container -->
  <rect x="200" y="150" width="${WIDTH - 400}" height="${HEIGHT - 300}" 
        fill="rgba(255,255,255,0.15)" rx="24" 
        stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  
  <!-- Icon -->
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 - 60}" 
        font-family="Arial, sans-serif" font-size="120" 
        text-anchor="middle" fill="rgba(255,255,255,0.9)">
    ${template.icon}
  </text>
  
  <!-- Template Name -->
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 40}" 
        font-family="Arial, sans-serif" font-size="48" font-weight="bold"
        text-anchor="middle" fill="white">
    ${template.name}
  </text>
  
  <!-- Category -->
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 100}" 
        font-family="Arial, sans-serif" font-size="28"
        text-anchor="middle" fill="rgba(255,255,255,0.9)">
    ${template.category}
  </text>
  
  <!-- Decorative elements -->
  <rect x="50" y="50" width="4" height="80" fill="rgba(255,255,255,0.3)" rx="2"/>
  <rect x="${WIDTH - 54}" y="${HEIGHT - 130}" width="4" height="80" fill="rgba(255,255,255,0.3)" rx="2"/>
</svg>`;
}

async function generateImage(template: typeof templates[0]): Promise<void> {
  try {
    const svg = createTemplateSVG(template);
    const svgBuffer = Buffer.from(svg);
    
    const image = await sharp(svgBuffer)
      .resize(WIDTH, HEIGHT, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    const outputPath = join(OUTPUT_DIR, template.filename);
    writeFileSync(outputPath, image);
    
    console.log(`✅ Generated: ${template.filename} (${WIDTH}x${HEIGHT})`);
  } catch (error) {
    console.error(`❌ Error generating ${template.filename}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🎨 Generating template thumbnail images...\n');
  
  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });
  
  // Generate all images
  for (const template of templates) {
    await generateImage(template);
  }
  
  console.log(`\n✨ Successfully generated ${templates.length} template images!`);
  console.log(`📁 Images saved to: ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});


