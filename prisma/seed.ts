import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

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
      price: 10,
      interval: 'month',
      isActive: true,
    },
    {
      name: 'Pro',
      description: 'For professionals maximizing revenue',
      planEnum: 'PRO',
      price: 25,
      interval: 'month',
      isActive: true,
    },
    {
      name: 'Business',
      description: 'For teams and agencies',
      planEnum: 'BUSINESS',
      price: 50,
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
          planEnum: planData.planEnum as any, // Type assertion for enum
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
    { feature: 'storage_gb', limit: 1, enabled: true },
    { feature: 'custom_domains', limit: 0, enabled: false },
    { feature: 'subdomains', limit: 0, enabled: false },
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

  // CREATOR Plan Features (everything in FREE plus more)
  const creatorPlanFeatures = [
    { feature: 'pages', limit: null, enabled: true }, // Unlimited
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

  // PRO Plan Features (everything in CREATOR plus more)
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

  // BUSINESS Plan Features (everything in PRO plus more)
  const businessPlanFeatures = [
    { feature: 'pages', limit: null, enabled: true },
    { feature: 'storage_gb', limit: null, enabled: true }, // Unlimited
    { feature: 'custom_domains', limit: null, enabled: true }, // Unlimited
    { feature: 'subdomains', limit: null, enabled: true }, // Unlimited
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

  console.log('\n✅ Seeding completed!');
}

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

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
