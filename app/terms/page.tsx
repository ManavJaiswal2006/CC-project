import TermsOfService from '@/components/legal/terms'
import { termsPageDescription, termsPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: termsPageTitle,
  description: termsPageDescription,
};

function page() {
  return (
    <TermsOfService />
  )
}

export default page

