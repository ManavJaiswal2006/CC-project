import LoginPage from '@/components/login/login'
import { loginPageDescription, loginPageTitle } from '@/constants/metadata'

export const metadata = {
  title: loginPageTitle,
  description: loginPageDescription
}

function page() {
  return (
    <div><LoginPage /></div>
  )
}

export default page