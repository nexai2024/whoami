import MarketingHubLayout from '@/components/marketing/MarketingHubLayout';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingHubLayout>{children}</MarketingHubLayout>;
}
