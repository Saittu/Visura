'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { verifyPhone, sendPhoneCode } from '@/lib/api'

type VerifyPhoneModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess: () => void
}

export function VerifyPhoneModal({
  open,
  onOpenChange,
  userId,
  onSuccess
}: VerifyPhoneModalProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  async function handleVerify() {
    if (code.length !== 6) {
      setError('O código deve ter 6 dígitos.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await verifyPhone({ userId, code })
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Erro ao verificar telefone')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    try {
      setResending(true)
      setError(null)
      setResendMessage(null)
      await sendPhoneCode(userId)
      setResendMessage('Código reenviado com sucesso!')
    } catch (err: any) {
      setError(err?.message || 'Erro ao reenviar código')
    } finally {
      setResending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Verificar Telefone</DialogTitle>
          <DialogDescription>
            Enviamos um código de 6 dígitos por SMS para o seu telefone. Digite
            o código abaixo para verificar.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <Input
            placeholder='Código (6 dígitos)'
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className='dark:bg-background'
          />
          {error && <p className='text-sm text-red-500'>{error}</p>}
          {resendMessage && (
            <p className='text-sm text-green-500'>{resendMessage}</p>
          )}
          <Button
            variant='outline'
            onClick={handleResend}
            disabled={resending}
            className='w-full'
          >
            {resending ? 'Reenviando...' : 'Reenviar Código'}
          </Button>
        </div>
        <div className='flex justify-end gap-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleVerify} disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
