export type PlanKey = 'FREE' | 'BASIC' | 'PRO';

type LimitValue = number | 'unlimited';

type PlanLimits = {
  // Default per-feature limit when not explicitly listed below
  defaultEach: LimitValue;
  // Explicit overrides by feature name
  features: Record<string, LimitValue>;
};

export type PlanPricing = {
  monthlyUsd: number;
  yearlyUsd: number;
};

export const PLAN_PRICING: Record<PlanKey, PlanPricing> = {
  FREE: { monthlyUsd: 0, yearlyUsd: 0 },
  BASIC: { monthlyUsd: 5, yearlyUsd: 50 },
  PRO: { monthlyUsd: 10, yearlyUsd: 100 },
};

// Centralized plan configuration
export const PLAN_LIMITS: Record<PlanKey, PlanLimits> = {
  FREE: {
    defaultEach: 1,
    features: {
      // Core content quotas
      pages: 1,
      // Explicit limits
      leads: 100,
      emails: 100,
      ai_generations: 1, // matches defaultEach
      social_links: 1,
      auto_post_accounts: 1,
      // Scheduling is unlimited, but effective auto-post is constrained by linked accounts
      scheduler_posts: 'unlimited',
    },
  },
  BASIC: {
    defaultEach: 5,
    features: {
      pages: 5,
      leads: 1000,
      emails: 1000,
      ai_generations: 5,
      social_links: 3,
      auto_post_accounts: 3,
      scheduler_posts: 'unlimited',
    },
  },
  PRO: {
    defaultEach: 10,
    features: {
      pages: 10,
      leads: 2500,
      emails: 2500,
      ai_generations: 10,
      social_links: 'unlimited', // pro users can link unlimited socials
      auto_post_accounts: 'unlimited',
      scheduler_posts: 'unlimited',
    },
  },
};

export function getPlanKeyFromStrings(value?: string | null): PlanKey {
  const v = (value || '').toUpperCase();
  if (v.includes('PRO')) return 'PRO';
  if (v.includes('BASIC') || v.includes('CREATOR')) return 'BASIC';
  return 'FREE';
}

export function getLimitForFeature(plan: PlanKey, featureName: string): LimitValue {
  const cfg = PLAN_LIMITS[plan];
  if (!cfg) return 0;
  if (featureName in cfg.features) {
    return cfg.features[featureName];
  }
  return cfg.defaultEach;
}


