import AccountPage from '@/components/account/account'
import { accountPageDescription, accountPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: accountPageTitle,
  description: accountPageDescription,
};

function page() {
  return (
    <div><AccountPage /></div>
  )
}

export default page