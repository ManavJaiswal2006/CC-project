import DistributorPage from '@/components/distributor/distributor'
import { distributorPageDescription, distributorPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: distributorPageTitle,
  description: distributorPageDescription,
};

function page() {
  return (
    <ProtectedRoute>
      <DistributorPage />
    </ProtectedRoute>
  )
}

export default page

