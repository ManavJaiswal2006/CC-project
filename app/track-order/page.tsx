import TrackOrder from '@/components/track/track'
import { trackOrderPageDescription, trackOrderPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: trackOrderPageTitle,
  description: trackOrderPageDescription,
};

function page() {
  return (
    <TrackOrder />
  )
}

export default page
