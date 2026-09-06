'use client'

import { Suspense } from 'react'

import { RegisterExperience } from '@/features/register/components/RegisterExperience'

/** Registration entry — prompt-first experience (Lovable-style). */
const Register = () => {
  return (
    <Suspense fallback={null}>
      <RegisterExperience />
    </Suspense>
  )
}

export default Register
