'use client'

import { Input } from '../../components/ui/input/page'
import { Button } from '@/app/components/ui/button/page'
import { Checkbox } from '@/app/components/ui/checkbox/page'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/app/components/ui/hoverCard/page'
import { Label } from '@/app/components/ui/label/page'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [LoginPassword, setLoginPassword] = useState(false)

  function handleCheckboxChange() {
    setLoginPassword(!LoginPassword)
  }

  return (
    <div className='flex h-screen items-center justify-center'>
      <main className='dark:bg-card h-auto w-160 rounded-lg border-2'>
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
            {!LoginPassword && (
              <Input
                type='password'
                placeholder='Senha'
                className='dark:bg-background mt-4'
              />
            )}

            <div className='mt-6 ml-1 flex items-center'>
              <Checkbox id='TypeLogin' onCheckedChange={handleCheckboxChange} />
              <Label htmlFor='TypeLogin' className='ml-2 text-[14px]'>
                Entrar sem senha.
              </Label>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    variant='hoverCard'
                    size='hc'
                    className='relative ml-1'
                  >
                    ?
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div>
                    <p>
                      No momento de entrada será encaminhado para seu e-mail um
                      código de uso único para entrada.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
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

          <div className='flex items-center justify-center gap-8 pb-8'>
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
