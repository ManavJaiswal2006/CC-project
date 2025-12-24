import PromosPage from '@/components/Admin/promos'
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
      <div><PromosPage /></div>
    </AdminProtectedRoute>
  )
}

export default page

