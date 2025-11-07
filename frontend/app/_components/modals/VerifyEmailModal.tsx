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
import { verifyEmail } from '@/lib/api'

type VerifyEmailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  onSuccess: () => void
}

export function VerifyEmailModal({
  open,
  onOpenChange,
  email,
  onSuccess
}: VerifyEmailModalProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleVerify() {
    if (code.length !== 6) {
      setError('O código deve ter 6 dígitos.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await verifyEmail({ code })
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Erro ao verificar e-mail')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Verificar E-mail</DialogTitle>
          <DialogDescription>
            Enviamos um código de 6 dígitos para <strong>{email}</strong>.
            Digite o código abaixo para verificar seu e-mail.
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
