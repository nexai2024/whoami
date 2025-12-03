/**
 * SEO Audit Tool
 * Analyzes pages and provides SEO scores and recommendations
 */

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  recommendation?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SEOAuditResult {
  score: number; // 0-100
  issues: SEOIssue[];
  passed: number;
  warnings: number;
  errors: number;
  recommendations: string[];
}

export interface PageSEOData {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  description?: string;
  ogImage?: string;
  url?: string;
  customDomain?: string;
  subdomain?: string;
  blocks?: Array<{ type: string; title?: string; description?: string }>;
  user?: {
    profile?: {
      displayName?: string;
      bio?: string;
    };
  };
}

/**
 * Perform SEO audit on a page
 */
export function auditPageSEO(pageData: PageSEOData): SEOAuditResult {
  const issues: SEOIssue[] = [];
  let score = 100;

  // 1. Title checks
  const title = pageData.metaTitle || pageData.title;
  if (!title) {
    issues.push({
      type: 'error',
      field: 'title',
      message: 'Page title is missing',
      recommendation: 'Add a descriptive title (50-60 characters) that includes your main keyword',
      priority: 'high'
    });
    score -= 15;
  } else {
    if (title.length < 30) {
      issues.push({
        type: 'warning',
        field: 'title',
        message: 'Title is too short (under 30 characters)',
        recommendation: 'Expand your title to 50-60 characters for better SEO',
        priority: 'medium'
      });
      score -= 5;
    } else if (title.length > 60) {
      issues.push({
        type: 'warning',
        field: 'title',
        message: 'Title is too long (over 60 characters)',
        recommendation: 'Shorten your title to 50-60 characters to avoid truncation in search results',
        priority: 'medium'
      });
      score -= 3;
    }
  }

  // 2. Meta description checks
  const description = pageData.metaDescription || pageData.description;
  if (!description) {
    issues.push({
      type: 'error',
      field: 'metaDescription',
      message: 'Meta description is missing',
      recommendation: 'Add a compelling meta description (150-160 characters) that summarizes your page',
      priority: 'high'
    });
    score -= 15;
  } else {
    if (description.length < 120) {
      issues.push({
        type: 'warning',
        field: 'metaDescription',
        message: 'Meta description is too short (under 120 characters)',
        recommendation: 'Expand your description to 150-160 characters for better click-through rates',
        priority: 'medium'
      });
      score -= 5;
    } else if (description.length > 160) {
      issues.push({
        type: 'warning',
        field: 'metaDescription',
        message: 'Meta description is too long (over 160 characters)',
        recommendation: 'Shorten your description to 150-160 characters to avoid truncation',
        priority: 'medium'
      });
      score -= 3;
    }
  }

  // 3. Open Graph image check
  if (!pageData.ogImage) {
    issues.push({
      type: 'warning',
      field: 'ogImage',
      message: 'Open Graph image is missing',
      recommendation: 'Add an OG image (1200x630px) to improve social media sharing appearance',
      priority: 'medium'
    });
    score -= 10;
  }

  // 4. URL structure check
  const url = pageData.url || pageData.customDomain || pageData.subdomain;
  if (!url) {
    issues.push({
      type: 'error',
      field: 'url',
      message: 'Page URL is not configured',
      recommendation: 'Set up a custom domain or subdomain for better SEO',
      priority: 'high'
    });
    score -= 10;
  } else {
    // Check for clean URL structure
    if (url.includes('_') || url.includes(' ')) {
      issues.push({
        type: 'info',
        field: 'url',
        message: 'URL contains underscores or spaces',
        recommendation: 'Use hyphens instead of underscores or spaces in URLs (e.g., my-page instead of my_page)',
        priority: 'low'
      });
      score -= 2;
    }
  }

  // 5. Content checks
  const hasContent = pageData.blocks && pageData.blocks.length > 0;
  if (!hasContent) {
    issues.push({
      type: 'warning',
      field: 'content',
      message: 'Page has no content blocks',
      recommendation: 'Add content blocks to provide value to visitors and improve SEO',
      priority: 'medium'
    });
    score -= 10;
  } else {
    // Check for headings
    const hasHeadings = pageData.blocks.some(block => 
      block.type === 'TEXT_BLOCK' && block.title
    );
    if (!hasHeadings) {
      issues.push({
        type: 'info',
        field: 'content',
        message: 'Page lacks clear headings',
        recommendation: 'Add text blocks with titles to structure your content and improve readability',
        priority: 'low'
      });
      score -= 3;
    }
  }

  // 6. Profile information check
  if (pageData.user?.profile) {
    if (!pageData.user.profile.displayName) {
      issues.push({
        type: 'warning',
        field: 'profile',
        message: 'Display name is missing',
        recommendation: 'Add a display name to personalize your page',
        priority: 'medium'
      });
      score -= 5;
    }

    if (!pageData.user.profile.bio || pageData.user.profile.bio.length < 50) {
      issues.push({
        type: 'info',
        field: 'profile',
        message: 'Bio is missing or too short',
        recommendation: 'Add a detailed bio (100+ characters) to provide context about who you are',
        priority: 'low'
      });
      score -= 3;
    }
  }

  // 7. Keywords check (optional but recommended)
  if (!pageData.metaKeywords) {
    issues.push({
      type: 'info',
      field: 'metaKeywords',
      message: 'Meta keywords are not set',
      recommendation: 'While not required, adding relevant keywords can help with SEO',
      priority: 'low'
    });
    score -= 2;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  const errors = issues.filter(i => i.type === 'error').length;
  const warnings = issues.filter(i => i.type === 'warning').length;
  const passed = issues.filter(i => i.type === 'info').length;

  // Generate top recommendations
  const recommendations = issues
    .filter(i => i.priority === 'high' || i.priority === 'medium')
    .slice(0, 5)
    .map(i => i.recommendation || i.message);

  return {
    score: Math.round(score),
    issues,
    passed,
    warnings,
    errors,
    recommendations
  };
}

/**
 * Get SEO score color/status
 */
export function getSEOScoreStatus(score: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
} {
  if (score >= 90) {
    return { status: 'excellent', color: 'green' };
  } else if (score >= 70) {
    return { status: 'good', color: 'blue' };
  } else if (score >= 50) {
    return { status: 'fair', color: 'yellow' };
  } else {
    return { status: 'poor', color: 'red' };
  }
}


