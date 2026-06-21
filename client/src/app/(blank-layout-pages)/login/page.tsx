// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Login from '@views/Login'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account'
}

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const mode = await getServerMode()
  const { error } = await searchParams

  return <Login mode={mode} error={error} />
}

export default LoginPage
