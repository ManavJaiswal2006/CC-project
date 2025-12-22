import ProductPage from '@/components/shop/id'
import { productPageDescription, productPageTitle } from '@/constants/metadata'

export const metadata = {
  title: productPageTitle,
  description: productPageDescription
}


function page() {
  return (
    <div><ProductPage /></div>
  )
}

export default page