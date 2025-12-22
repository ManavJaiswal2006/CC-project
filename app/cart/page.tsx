import CartPage from '@/components/cart/cart'
import { cartPageDescription, cartPageTitle } from '@/constants/metadata';

export const metadata = {
  title: cartPageTitle,
  description: cartPageDescription,
};

function page() {
  return (
    <div>
      <CartPage />
    </div>
  )
}

export default page