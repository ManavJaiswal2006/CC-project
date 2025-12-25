import DistributorApplicationsPage from '@/components/Admin/distributorApplications'
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

export default function page() {
  return (
    <AdminProtectedRoute>
      <DistributorApplicationsPage />
    </AdminProtectedRoute>
  )
}

