import PrivacyPolicy from '@/components/legal/privacy'
import { privacyPageDescription, privacyPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: privacyPageTitle,
  description: privacyPageDescription,
};

function page() {
  return (
    <PrivacyPolicy />
  )
}

export default page

