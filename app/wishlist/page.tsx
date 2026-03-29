import WishlistPage from '@/components/wishlist/wishlist'
import { Metadata } from 'next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: "My Wishlist | cc-project Industries",
  description: "View and manage your saved products. Add items to cart from your wishlist.",
};

function page() {
  return (
    <ProtectedRoute>
      <WishlistPage />
    </ProtectedRoute>
  )
}

export default page

