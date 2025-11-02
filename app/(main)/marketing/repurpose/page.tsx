import RepurposeUpload from '@/components/marketing/repurpose/RepurposeUpload';
import NotReleased from '@/components/NotReleased';

export default function RepurposePage() {
  if (process.env.NEXT_PUBLIC_BETA_FEATURE_RELEASE !== 'true') {
    return <NotReleased />;
  }
  return <RepurposeUpload />;
}
