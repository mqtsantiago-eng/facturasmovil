// C:\dev\facturasmovil\app\auth\reset-password\page.tsx

'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    setError(null)
    setMessage(null)

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      setMessage('Contraseña actualizada correctamente')

      // 👇 redirigir después de unos segundos
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 2000)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6">

          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-8 w-8" />
            <span className="text-2xl font-bold">FacturaApp</span>
          </div>

          <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Nueva contraseña</CardTitle>
              <CardDescription>
                Introduce tu nueva contraseña
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleReset}>
                <div className="flex flex-col gap-4">

                  <div className="grid gap-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm">Confirmar contraseña</Label>
                    <Input
                      id="confirm"
                      type="password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive text-center">
                      {error}
                    </p>
                  )}

                  {message && (
                    <p className="text-sm text-green-600 text-center">
                      {message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="mr-2" />
                        Guardando...
                      </>
                    ) : (
                      'Actualizar contraseña'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}