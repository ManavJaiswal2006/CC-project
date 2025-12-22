import ShopPage from '@/components/shop/shop'
import { shopPageDescription, shopPageTitle } from '@/constants/metadata'

export const metadata = {
  title: shopPageTitle,
  description: shopPageDescription
}

function page() {
  return (
    <div><ShopPage /></div>
  )
}

export default page