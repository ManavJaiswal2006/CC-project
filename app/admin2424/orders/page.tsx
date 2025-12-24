import AdminOrdersPage from '@/components/Admin/orders'
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';

export default function page() {
  return (
    <AdminProtectedRoute>
      <AdminOrdersPage />
    </AdminProtectedRoute>
  )
}
