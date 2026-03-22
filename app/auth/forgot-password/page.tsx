// C:\dev\facturasmovil\app\auth\forgot-password\page.tsx

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
import Link from 'next/link'
import { useState } from 'react'
import { FileText } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setMessage('Te hemos enviado un enlace para restablecer tu contraseña.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar el email')
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
              <CardTitle className="text-xl">Recuperar contraseña</CardTitle>
              <CardDescription>
                Introduce tu email y te enviaremos un enlace
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleReset}>
                <div className="flex flex-col gap-4">

                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  {message && (
                    <p className="text-sm text-green-600 text-center">
                      {message}
                    </p>
                  )}

                  {error && (
                    <p className="text-sm text-destructive text-center">
                      {error}
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
                        Enviando...
                      </>
                    ) : (
                      'Enviar enlace'
                    )}
                  </Button>
                </div>

                <div className="mt-6 text-center text-sm">
                  <Link
                    href="/auth/login"
                    className="text-primary underline underline-offset-4"
                  >
                    Volver al login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}