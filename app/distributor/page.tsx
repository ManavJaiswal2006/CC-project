import DistributorPage from '@/components/distributor/distributor'
import { distributorPageDescription, distributorPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: distributorPageTitle,
  description: distributorPageDescription,
};

function page() {
  return (
    <DistributorPage />
  )
}

export default page

