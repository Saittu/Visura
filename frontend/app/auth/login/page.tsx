'use client'

import { Input } from '../../_components/ui/input'
import { Button } from '@/app/_components/ui/button'
import { Checkbox } from '@/app/_components/ui/checkbox'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/app/_components/ui/hoverCard'
import { Label } from '@/app/_components/ui/label'
import { login } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { login as apiLogin, type LoginPayload } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [LoginPassword, setLoginPassword] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loginUserId, setLoginUserId] = useState<string | null>(null)

  function handleCheckboxChange() {
    setLoginPassword(!LoginPassword)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!LoginPassword && !password) {
      setError('Por favor, insira sua senha.')
      return
    }

    const payload: LoginPayload = {
      email,
      password
    }

    try {
      setLoading(true)
      const response = await apiLogin(payload)

      setLoginUserId(response.user.id)

      setSuccess('Login realizado com sucesso!')
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.')
    } finally {
      setLoading(false)
      setPassword('')
      setTimeout(() => {
        router.push('/')
      }, 500)
    }
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

          <form className='p-10' onSubmit={onSubmit}>
            <h2 className='mb-3 ml-1 text-[20px] font-medium'>Entrar</h2>
            <Input
              type='email'
              placeholder='Email'
              value={email}
              className='dark:bg-background'
              onChange={(e) => setEmail(e.target.value)}
            />
            {!LoginPassword && (
              <Input
                type='password'
                placeholder='Senha'
                value={password}
                className='dark:bg-background mt-4'
                onChange={(e) => setPassword(e.target.value)}
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
            {error && <p className='mt-4 text-sm text-red-500'>{error}</p>}
            {success && (
              <p className='mt-4 text-sm text-green-500'>{success}</p>
            )}
            <div className='mt-6 flex justify-center gap-5 px-13'>
              <Button
                className='w-1/2'
                variant='outline'
                onClick={() => router.push('/auth/register')}
              >
                Cadastrar
              </Button>
              <Button className='w-1/2' type='submit' disabled={loading}>
                {loading ? 'Carregando...' : 'Continuar'}
              </Button>
            </div>
          </form>

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
