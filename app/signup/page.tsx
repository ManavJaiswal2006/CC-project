import SignUpPage from '@/components/signup/signup'
import { signupPageDescription, signupPageTitle } from '@/constants/metadata'

export const metadata = {
  title: signupPageTitle,
  description: signupPageDescription,
}

function page() {
  return (
    <div><SignUpPage /></div>
  )
}

export default page