import CampaignDashboard from '@/components/marketing/campaigns/CampaignDashboard';
import NotReleased from '@/components/NotReleased';

export default function CampaignsPage() {
  if (process.env.NEXT_PUBLIC_BETA_FEATURE_RELEASE !== 'true') {
    return <NotReleased />;
  }
  return <CampaignDashboard />;
}
