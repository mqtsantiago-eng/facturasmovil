// C:\dev\facturasmovil\app\auth\login\page.tsx

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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false) // ✅ nuevo
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // 👇 guardar preferencia (opcional)
      if (remember) {
        localStorage.setItem('remember', 'true')
      } else {
        localStorage.removeItem('remember')
      }

      // 👇 esperar cookies
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 👇 redirect fiable
      window.location.href = '/dashboard'

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Ha ocurrido un error')
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
              <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  
                  {/* EMAIL */}
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Contraseña</Label>

                      <Link
                        href="/auth/forgot-password"
                        className="text-xs text-primary underline underline-offset-4"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>

                    <Input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  {/* ✅ RECORDARME */}
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <Label htmlFor="remember">Recordarme</Label>
                  </div>

                  {/* ERROR */}
                  {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )}

                  {/* BOTÓN */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="mr-2" />
                        Iniciando...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                </div>

                {/* REGISTRO */}
                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">¿No tienes cuenta? </span>
                  <Link
                    href="/auth/sign-up"
                    className="text-primary font-medium underline underline-offset-4"
                  >
                    Regístrate
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