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
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register as apiRegister, type RegisterPayload } from '@/lib/api'
import { VerifyEmailModal } from '@/app/_components/modals/VerifyEmailModal'
import { VerifyPhoneModal } from '@/app/_components/modals/VerifyPhoneModal'

export default function RegisterPage() {
  const router = useRouter()
  const [LoginPassword, setLoginPassword] = useState(false)

  const [username, setUsername] = useState('')
  const [telephone, setTelephone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null)

  function handleCheckboxChange() {
    setLoginPassword(!LoginPassword)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!LoginPassword && !password) {
      setError('Informe uma senha.')
      return
    }

    const payload: RegisterPayload = {
      email,
      username,
      password: LoginPassword ? 'temp-pass-ignored' : password,
      name,
      telephone
    }

    try {
      setLoading(true)
      const res = await apiRegister(payload)

      // Armazenar tokens no client (dev). Em produção cookies httpOnly via rota /api.
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', res.accessToken)
        localStorage.setItem('refreshToken', res.refreshToken)
        if (res.userId) {
          localStorage.setItem('userId', res.userId)
          setRegisteredUserId(res.userId)
        }
      }

      setSuccess('Registrado! Agora vamos verificar seu e-mail e telefone.')
      // Abrir modal de verificação de e-mail após 500ms
      setTimeout(() => {
        setShowEmailModal(true)
      }, 500)
    } catch (err: any) {
      setError(err?.message || 'Falha ao registrar')
    } finally {
      setLoading(false)
    }
  }

  function handleEmailVerified() {
    setShowEmailModal(false)
    setSuccess('E-mail verificado! Agora vamos verificar seu telefone.')
    // Abrir modal de telefone após fechar o de e-mail
    setTimeout(() => {
      setShowPhoneModal(true)
    }, 300)
  }

  function handlePhoneVerified() {
    setShowPhoneModal(false)
    setSuccess('Telefone verificado! Redirecionando para login...')
    setTimeout(() => {
      router.push('/auth/login')
    }, 1000)
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
            <h2 className='mb-3 ml-1 text-[20px] font-medium'>Cadastrar</h2>
            <div className='flex gap-2'>
              <Input
                type='text'
                placeholder='Nome de usuário'
                className='dark:bg-background'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                type='text'
                placeholder='Telefone (+5511999999999)'
                className='dark:bg-background'
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>
            <Input
              type='text'
              placeholder='Nome completo'
              className='dark:bg-background mt-4'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type='email'
              placeholder='E-mail'
              className='dark:bg-background mt-4'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!LoginPassword && (
              <Input
                type='password'
                placeholder='Senha'
                className='dark:bg-background mt-4'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            <div className='mt-6 flex justify-between pr-2'>
              <div className='flex items-center'>
                <Checkbox
                  id='TypeLogin'
                  onCheckedChange={handleCheckboxChange}
                />
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
                        No momento de entrada será encaminhado para seu e-mail
                        um código de uso único para entrada.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <p className='text-foreground ml-1 text-[14px]'>
                Tem uma conta?{' '}
                <Link
                  href={'/auth/login'}
                  className='text-sidebar-primary hover:text-blue-500'
                >
                  Entrar
                </Link>
              </p>
            </div>
            {error && <p className='mt-4 text-sm text-red-500'>{error}</p>}
            {success && (
              <p className='mt-4 text-sm text-green-500'>{success}</p>
            )}
            <div className='mt-6 mb-6 flex justify-center'>
              <Button className='w-full' type='submit' disabled={loading}>
                {loading ? 'Enviando...' : 'Continuar'}
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

      {/* Modais de verificação sequenciais */}
      <VerifyEmailModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        email={email}
        onSuccess={handleEmailVerified}
      />
      <VerifyPhoneModal
        open={showPhoneModal}
        onOpenChange={setShowPhoneModal}
        userId={registeredUserId || ''}
        onSuccess={handlePhoneVerified}
      />
    </div>
  )
}
