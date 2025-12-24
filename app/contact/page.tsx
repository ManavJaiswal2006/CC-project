import ContactUs from '@/components/legal/contact'
import { contactPageDescription, contactPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: contactPageTitle,
  description: contactPageDescription,
};

function page() {
  return (
    <ContactUs />
  )
}

export default page

