import AdminPage from '@/components/Admin/admin'
import { adminPageDescription, adminPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: adminPageTitle,
  description: adminPageDescription,
};

function page() {
  return (
    <div><AdminPage /></div>
  )
}

export default page