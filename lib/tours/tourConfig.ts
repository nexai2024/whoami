/**
 * Tour Configuration
 * Defines all interactive guided tours for the application
 */

export type TourStep = {
  target: string; // data-tour-id attribute value
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlightPulse?: boolean;
  showProgress?: boolean;
  action?: 'next' | 'complete' | 'navigate';
  navigationPath?: string; // Path to navigate to before showing step
};

export type Tour = {
  id: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  autoTrigger?: {
    condition: 'first_visit' | 'no_pages' | 'custom';
    path?: string;
    customCheck?: () => boolean;
  };
  steps: TourStep[];
  category: 'getting_started' | 'advanced' | 'marketing';
};

export const tours: Tour[] = [
  // Tour 1: Getting Started - Create Your First Page
  {
    id: 'tour_1_getting_started',
    name: 'Getting Started - Create Your First Page',
    description: 'Learn the basics of creating and managing pages in your dashboard.',
    estimatedMinutes: 2,
    category: 'getting_started',
    autoTrigger: {
      condition: 'no_pages',
      path: '/pages',
    },
    steps: [
      {
        target: 'page-manager-header',
        title: 'Welcome to Your Page Manager',
        content: 'This is where you\'ll create and manage all your pages. Each page is a custom landing page or link-in-bio page you can share with your audience.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'create-page-button',
        title: 'Create Your First Page',
        content: 'Click this button to create a new page. You\'ll be taken to the page builder where you can customize everything.',
        position: 'bottom',
        highlightPulse: true,
        showProgress: true,
        action: 'next',
      },
      {
        target: 'builder-tabs',
        title: 'Page Builder Interface',
        content: 'The page builder has three sections: Header (personal info), Content Blocks (your page content), and Settings (SEO and configuration).',
        position: 'bottom',
        showProgress: true,
        action: 'next',
        navigationPath: '/builder',
      },
      {
        target: 'save-button',
        title: 'Save Your Work',
        content: 'Always save your changes before leaving. Your page will be stored as a draft until you publish it.',
        position: 'left',
        showProgress: true,
        action: 'complete',
      },
    ],
  },

  // Tour 2: Page Builder Essentials
  {
    id: 'tour_2_builder_essentials',
    name: 'Page Builder Essentials',
    description: 'Master the block-based editor and learn how to build beautiful pages.',
    estimatedMinutes: 3,
    category: 'getting_started',
    autoTrigger: {
      condition: 'first_visit',
      path: '/builder',
    },
    steps: [
      {
        target: 'blocks-tab',
        title: 'Content Blocks Tab',
        content: 'This is where you build your page content. Let\'s explore how blocks work.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'block-library',
        title: 'Block Library',
        content: 'Choose from 23 different block types - links, products, images, videos, email capture, and more. Each block is a building block for your page.',
        position: 'right',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'add-link-block',
        title: 'Add Your First Block',
        content: 'Click any block type to add it to your page. Try adding a Link block now.',
        position: 'right',
        highlightPulse: true,
        showProgress: true,
        action: 'next',
      },
      {
        target: 'block-canvas',
        title: 'Your Page Canvas',
        content: 'Blocks appear here in the order they\'ll show on your published page. You can drag blocks to reorder them.',
        position: 'right',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'block-editor',
        title: 'Block Properties Editor',
        content: 'When you select a block, its properties appear here. Edit the title, URL, styling, and block-specific settings.',
        position: 'left',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'block-editor',
        title: 'Try Editing a Block',
        content: 'Click on any block in the canvas to select it, then modify its properties in this editor.',
        position: 'left',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'preview-button',
        title: 'Preview Your Page',
        content: 'Click Preview anytime to see how your page looks to visitors. Opens in a new tab.',
        position: 'left',
        showProgress: true,
        action: 'complete',
      },
    ],
  },

  // Tour 3: Publishing Your Page
  {
    id: 'tour_3_publishing',
    name: 'Publishing Your Page',
    description: 'Learn how to configure SEO settings and publish your page to the world.',
    estimatedMinutes: 2,
    category: 'getting_started',
    steps: [
      {
        target: 'settings-tab',
        title: 'Page Settings',
        content: 'Before publishing, let\'s configure your page settings for SEO and visibility.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'page-title-input',
        title: 'Page Title',
        content: 'This is the title shown in browser tabs and search results. Make it descriptive and compelling.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'page-slug-input',
        title: 'Page URL',
        content: 'This is your page\'s unique URL. Choose something memorable and easy to share.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'page-description-input',
        title: 'Page Description',
        content: 'Write a brief description for search engines. This helps people find your page through Google and social media.',
        position: 'top',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'save-button',
        title: 'Save and Publish',
        content: 'Save your changes. Your page is now published and accessible via your custom URL!',
        position: 'left',
        highlightPulse: true,
        showProgress: true,
        action: 'complete',
      },
    ],
  },

  // Tour 4: AI Campaign Generation
  {
    id: 'tour_4_campaigns',
    name: 'AI Campaign Generation',
    description: 'Learn how to use AI to generate complete marketing campaigns with social posts, emails, and landing page variants.',
    estimatedMinutes: 4,
    category: 'marketing',
    steps: [
      {
        target: 'help-modal-content',
        title: 'AI Campaign Generation Overview',
        content: 'Generate complete marketing campaigns with AI: social posts for 5 platforms, email sequences, and landing page variants. Takes 30-60 seconds per campaign.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'help-modal-content',
        title: 'Campaign API Endpoint',
        content: 'POST to /api/campaigns/generate with your content source (productId, blockId, or customContent). The AI will analyze your content and generate platform-specific marketing assets.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'help-modal-content',
        title: 'Campaign Configuration',
        content: 'Customize your campaign: choose platforms (Twitter, Instagram, Facebook, LinkedIn, TikTok), set tone (Professional, Casual, Excited, Educational), and define your goal (Launch, Promotion, Engagement).',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'help-modal-content',
        title: 'Generated Assets',
        content: 'Each campaign includes: Platform-optimized social posts (character limits respected), Email sequence with subjects and bodies, Landing page headline variants for A/B testing.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'help-modal-content',
        title: 'Rate Limits & Best Practices',
        content: 'Limit: 5 campaigns per hour. Status flow: DRAFT → GENERATING → READY/FAILED. Check campaign status via GET /api/campaigns/[id].',
        position: 'bottom',
        showProgress: true,
        action: 'complete',
      },
    ],
  },

  // Tour 5: Lead Magnet Automation
  {
    id: 'tour_5_lead_magnets',
    name: 'Lead Magnet Automation',
    description: 'Create automated content upgrades that capture emails and deliver digital products.',
    estimatedMinutes: 4,
    category: 'marketing',
    autoTrigger: {
      condition: 'first_visit',
      path: '/lead-magnets',
    },
    steps: [
      {
        target: 'lead-magnet-header',
        title: 'Lead Magnet Automation Suite',
        content: 'Create content upgrades that automatically capture emails and deliver digital products. Perfect for growing your email list.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'lead-magnet-tabs',
        title: 'Magnets vs Templates',
        content: 'My Lead Magnets shows your created magnets with performance stats. Templates provides professional templates to get started faster.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'create-magnet-button',
        title: 'Create Your First Lead Magnet',
        content: 'Click here to create a new lead magnet. You\'ll choose the type, configure delivery, and set up your opt-in form.',
        position: 'bottom',
        highlightPulse: true,
        showProgress: true,
        action: 'next',
      },
      {
        target: 'lead-magnet-tabs',
        title: '11 Magnet Types Available',
        content: 'PDF, Ebook, Template, Checklist, Workbook, Video, Video Course, Audio, Spreadsheet, ZIP Bundle, or Custom. Each type has specialized delivery options.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'lead-magnet-tabs',
        title: 'Delivery Methods',
        content: 'Instant Download: Immediate access after opt-in. Email Delivery: Send via email automatically. Gated Access: Login required. Drip Course: Release content on a schedule.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'magnet-stats',
        title: 'Performance Tracking',
        content: 'Track Views (how many saw your opt-in), Opt-ins (email captures), and Conversion Rate (opt-ins / views). Monitor what works best.',
        position: 'top',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'templates-tab',
        title: 'Professional Templates',
        content: 'Browse featured templates with thumbnails and use counts. Click "Use This Template" to start with pre-configured settings.',
        position: 'top',
        showProgress: true,
        action: 'complete',
      },
    ],
  },

  // Tour 6: Smart Scheduling Engine
  {
    id: 'tour_6_scheduling',
    name: 'Smart Scheduling Engine',
    description: 'Schedule posts across multiple platforms with AI-optimized timing for maximum engagement.',
    estimatedMinutes: 4,
    category: 'marketing',
    autoTrigger: {
      condition: 'first_visit',
      path: '/schedule',
    },
    steps: [
      {
        target: 'scheduler-header',
        title: 'Smart Scheduling Engine',
        content: 'Schedule posts across Twitter, Instagram, Facebook, LinkedIn, TikTok, and Email with AI-optimized timing for maximum engagement.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'scheduler-tabs',
        title: 'Three Views',
        content: 'Calendar: See all scheduled posts. Optimal Times: AI recommendations for best posting times. History: Past post performance.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'schedule-post-button',
        title: 'Schedule Your First Post',
        content: 'Click here to create a scheduled post. You\'ll choose platform, write content, upload media, and set the publish time.',
        position: 'bottom',
        highlightPulse: true,
        showProgress: true,
        action: 'next',
      },
      {
        target: 'post-card',
        title: 'Post Cards',
        content: 'Each post shows platform, scheduled time, status, content preview, and media. Edit or cancel pending posts. View performance for published posts.',
        position: 'right',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'post-status',
        title: 'Post Status Flow',
        content: 'PENDING: Waiting to publish. PROCESSING: Currently publishing. PUBLISHED: Live on platform. FAILED: Error occurred (retries attempted). CANCELLED: Manually cancelled.',
        position: 'right',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'optimal-times-tab',
        title: 'AI-Powered Optimal Times',
        content: 'Our AI analyzes your audience engagement to recommend the best times to post for each platform.',
        position: 'bottom',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'optimal-time-card',
        title: 'Time Recommendations',
        content: 'Each recommendation shows day, hour, platform, engagement rate, confidence score, and reasoning. Ranked by effectiveness (#1, #2, #3).',
        position: 'right',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'engagement-rate',
        title: 'Engagement Metrics',
        content: 'Historical engagement rate shows how well posts performed at this time. Higher is better. Confidence score shows data reliability.',
        position: 'top',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'scheduler-tabs',
        title: 'Auto-Post vs Manual Approval',
        content: 'Enable auto-post for automatic publishing at scheduled time. Disable for manual review and approval before each post goes live.',
        position: 'bottom',
        showProgress: true,
        action: 'complete',
      },
    ],
  },

  // Tour 7: Advanced Block Editing
  {
    id: 'tour_7_advanced_editing',
    name: 'Advanced Block Editing - Full Coverage',
    description: 'Master all 23 block types, advanced styling, keyboard shortcuts, and mobile responsiveness.',
    estimatedMinutes: 5,
    category: 'advanced',
    steps: [
      {
        target: 'block-library',
        title: '23 Block Types Overview',
        content: 'Link, Product, Email, Image, Music, Video, Booking, Analytics, Promo, Discount, Social Share, Waitlist, Newsletter, Tip, Social Feed, AMA, Gated, RSS, Portfolio, Contact, Divider, Text, Custom.',
        position: 'right',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'block-editor',
        title: 'Block Styling Controls',
        content: 'Each block has styling options: colors, fonts, spacing, borders. Access these in the block editor when a block is selected.',
        position: 'left',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'block-canvas',
        title: 'Block Reordering',
        content: 'Click and hold the drag handle (⋮⋮) to reorder blocks. Drag up or down to change position. Changes save automatically.',
        position: 'left',
        highlightPulse: true,
        showProgress: true,
        action: 'next',
      },
      {
        target: 'preview-button',
        title: 'Mobile Preview',
        content: 'Click Preview to see your page. Use browser dev tools or resize window to check mobile responsiveness. Blocks automatically adapt.',
        position: 'left',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'block-editor',
        title: 'Block-Specific Properties - Product',
        content: 'Product blocks have price, currency, stock status. Email blocks have description and button text. Video blocks have platform and controls. Each type has unique properties.',
        position: 'left',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'block-canvas',
        title: 'Delete Blocks',
        content: 'Click the trash icon to remove a block. This action is permanent once you save, so use carefully.',
        position: 'left',
        showProgress: true,
        action: 'next',
      },
      {
        target: 'save-button',
        title: 'Keyboard Shortcuts',
        content: 'Ctrl+S / Cmd+S: Save. Ctrl+P / Cmd+P: Preview. Arrow keys: Navigate between blocks (when one is selected). Delete: Remove selected block.',
        position: 'left',
        showProgress: true,
        action: 'complete',
      },
    ],
  },
];

// Helper function to get tour by ID
export const getTourById = (tourId: string): Tour | undefined => {
  return tours.find(tour => tour.id === tourId);
};

// Helper function to get tours by category
export const getToursByCategory = (category: Tour['category']): Tour[] => {
  return tours.filter(tour => tour.category === category);
};

// Helper function to get auto-triggered tour for a path
export const getAutoTriggerTour = (path: string, hasPages: boolean = true): Tour | undefined => {
  return tours.find(tour => {
    if (!tour.autoTrigger) return false;
    if (tour.autoTrigger.path && !path.includes(tour.autoTrigger.path)) return false;
    if (tour.autoTrigger.condition === 'no_pages' && hasPages) return false;
    return true;
  });
};
