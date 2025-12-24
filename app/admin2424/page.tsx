import AdminPage from '@/components/Admin/admin'
import { adminPageDescription, adminPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

export const metadata: Metadata = {
  title: adminPageTitle,
  description: adminPageDescription,
};

function page() {
  return (
    <AdminProtectedRoute>
      <div><AdminPage /></div>
    </AdminProtectedRoute>
  )
}

export default page