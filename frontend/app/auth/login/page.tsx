'use client'

import { Input } from '../../components/ui/input/page'
import { Button } from '@/app/components/ui/button/page'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className='flex h-screen items-center justify-center'>
      <main className='dark:bg-card h-120 w-160 rounded-lg border-2'>
        <div>
          <div className='mb-1 flex items-center justify-center gap-2 pt-6'>
            <img src='/logo.svg' alt='teste' className='h-7 w-8' />
            <h1 className='text-foreground text-center text-3xl font-bold'>
              VISURA
            </h1>
          </div>

          <div className='p-10'>
            <h2 className='mb-3 ml-1 text-[20px] font-medium'>Entrar</h2>
            <Input
              type='email'
              placeholder='Email'
              className='dark:bg-background'
            />
            <Input
              type='password'
              placeholder='Senha'
              className='dark:bg-background mt-4'
            />
          </div>

          <div className='mb-6 flex justify-center gap-5 px-13'>
            <Button
              className='w-1/2'
              variant='outline'
              onClick={() => router.push('/auth/register')}
            >
              Cadastrar
            </Button>
            <Button className='w-1/2'>Continuar</Button>
          </div>

          <div className='mb-10 flex justify-center'>
            <div className='bg-border h-0.5 w-5/6'></div>
          </div>

          <div className='flex items-center justify-center gap-8'>
            <div className='bg-secondary-foreground rounded-lg p-2'>
              <img src='/Google_logo.png' alt='' className='w-7' />
            </div>

            <div className='bg-secondary-foreground rounded-lg p-2'>
              <img src='/github-outline.svg' alt='' className='w-7' />
            </div>

            <div className='bg-secondary-foreground rounded-lg pt-2 pr-3 pb-2 pl-3'>
              <img src='/Apple_logo_black.svg' alt='' className='h-7 w-6' />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
