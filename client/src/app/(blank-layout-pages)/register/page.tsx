// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Register from '@views/Register'

export const metadata: Metadata = {
  title: 'Build with AI · ServiceHub',
  description: 'Describe your website or pick a template, then create your workspace'
}

const RegisterPage = async () => {
  return <Register />
}

export default RegisterPage
