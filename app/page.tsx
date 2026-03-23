// C:\dev\facturasmovil\app\page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-6 w-6" />
            <span className="text-lg font-bold">FacturaApp</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Iniciar Sesion</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/sign-up">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center gap-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-balance">
                Genera facturas profesionales en segundos
              </h1>
              <p className="text-lg text-muted-foreground text-pretty">
                La forma mas rapida y sencilla de crear, gestionar y enviar facturas 
                desde cualquier dispositivo. Optimizado para movil.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Empezar Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">
                  Ya tengo cuenta
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center gap-3 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Facturas Rapidas</h3>
                <p className="text-sm text-muted-foreground">
                  Crea facturas profesionales en menos de un minuto
                </p>
              </div>
              <div className="flex flex-col items-center text-center gap-3 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold">100% Movil</h3>
                <p className="text-sm text-muted-foreground">
                  Diseñado para funcionar perfectamente en tu telefono
                </p>
              </div>
              <div className="flex flex-col items-center text-center gap-3 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold">PDF Profesional</h3>
                <p className="text-sm text-muted-foreground">
                  Exporta y comparte tus facturas como PDF al instante
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          FacturaApp - Tu solucion de facturacion simple
        </div>
      </footer>
    </div>
  )
}
