'use client'
import { ReactNode } from 'react'

interface MainShellProps {
  navigation: ReactNode
  rightPanel?: ReactNode
  children: ReactNode
}

export function MainShell({
  navigation,
  rightPanel,
  children
}: MainShellProps) {
  return (
    <div className='mx-auto max-w-[1400px] px-4'>
      <div className='grid grid-cols-[260px_1fr_320px] gap-8'>
        <div>{navigation}</div>
        <div className='mx-auto w-full max-w-2xl'>{children}</div>
        <div>{rightPanel}</div>
      </div>
    </div>
  )
}

export default MainShell
