import Shipping from '@/components/legal/shipping'
import { shippingPageDescription, shippingPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: shippingPageTitle,
  description: shippingPageDescription,
};

function page() {
  return (
    <Shipping />
  )
}

export default page

