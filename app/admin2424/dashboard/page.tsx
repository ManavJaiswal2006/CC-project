import AdminDashboard from '@/components/Admin/dashboard'
import { adminDashboardPageTitle, adminDashboardPageDescription } from '@/constants/metadata';
import { Metadata } from 'next';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

export const metadata: Metadata = {
  title: adminDashboardPageTitle,
  description: adminDashboardPageDescription,
};

function page() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  )
}

export default page
