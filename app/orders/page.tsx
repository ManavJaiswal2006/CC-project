import OrdersPage from '@/components/orders/orders'
import { ordersPageTitle, ordersPageDescription } from '@/constants/metadata';
import { Metadata } from 'next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: ordersPageTitle,
  description: ordersPageDescription,
};

function page() {
  return (
    <ProtectedRoute>
      <OrdersPage />
    </ProtectedRoute>
  )
}

export default page
