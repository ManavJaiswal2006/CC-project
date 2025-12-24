import ProductPage from '@/components/shop/id'
import { productPageDescription, productPageTitle } from '@/constants/metadata'
import { Metadata } from 'next';
import { generateSEO, generateStructuredData } from '@/lib/seo';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // In a real app, you'd fetch product data here
  // For now, return default metadata
  return generateSEO({
    title: productPageTitle,
    description: productPageDescription,
    type: "product",
  });
}

function page() {
  return (
    <div><ProductPage /></div>
  )
}

export default page