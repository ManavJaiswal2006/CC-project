import About from '@/components/about/about'
import { aboutPageDescription, aboutPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: aboutPageTitle,
  description: aboutPageDescription,
};

function page() {
  return (
    <About />
  )
}

export default page