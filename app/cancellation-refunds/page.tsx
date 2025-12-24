import CancellationRefunds from '@/components/legal/cancellation-refunds'
import { cancellationRefundsPageDescription, cancellationRefundsPageTitle } from '@/constants/metadata';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: cancellationRefundsPageTitle,
  description: cancellationRefundsPageDescription,
};

function page() {
  return (
    <CancellationRefunds />
  )
}

export default page

