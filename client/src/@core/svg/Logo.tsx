// React Imports
import type { SVGAttributes } from 'react'

/**
 * ServiceHub mark: a site canvas (frame + layout blocks) with a spark for the
 * generated content. Uses currentColor so it inherits the nav/auth text color.
 */
const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width='1em' height='1em' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <rect x='3.25' y='3.25' width='25.5' height='25.5' rx='5.25' stroke='currentColor' strokeWidth='2.5' />
      <rect x='7.5' y='7.5' width='17' height='2.5' rx='1.25' fill='currentColor' opacity='0.35' />
      <rect x='7.5' y='13' width='7' height='11.5' rx='1.75' fill='currentColor' />
      <rect x='16.5' y='13' width='8' height='4' rx='1.75' fill='currentColor' opacity='0.35' />
      <path
        d='M20.5 17.3C20.5 19.9 21.9 21.3 24.5 21.3C21.9 21.3 20.5 22.7 20.5 25.3C20.5 22.7 19.1 21.3 16.5 21.3C19.1 21.3 20.5 19.9 20.5 17.3Z'
        fill='currentColor'
      />
    </svg>
  )
}

export default Logo
