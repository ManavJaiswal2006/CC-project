import AccountPage from '@/components/account/account'
import { accountPageDescription, accountPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: accountPageTitle,
  description: accountPageDescription,
};

function page() {
  return (
    <ProtectedRoute>
      <div><AccountPage /></div>
    </ProtectedRoute>
  )
}

export default page