// C:\dev\facturasmovil\app\(protected)\dashboard\page.tsx

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

// 👇 IMPORTANTE: importar iconos aquí está OK mientras NO se pasen como props
import { FileText, Users, Plus, TrendingUp, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Empresa
  const { data: empresa } = await supabase
    .from('empresas')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!empresa) {
    redirect('/empresa/configurar')
  }

  // Stats
  const { count: clientesCount } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', empresa.id)

  const { count: facturasCount } = await supabase
    .from('facturas')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', empresa.id)

  const { data: facturasMes } = await supabase
    .from('facturas')
    .select('total')
    .eq('empresa_id', empresa.id)
    .gte(
      'fecha',
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
        .toISOString()
        .split('T')[0]
    )

  const totalMes =
    facturasMes?.reduce((sum, f) => sum + Number(f.total), 0) || 0

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div>
            <h1 className="text-lg font-semibold">Hola!</h1>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
              {empresa.nombre}
            </p>
          </div>

          <Button size="sm" asChild>
            <Link href="/facturas/nueva">
              <Plus className="h-4 w-4 mr-1" />
              Nueva Factura
            </Link>
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{clientesCount || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Facturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{facturasCount || 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Facturado este mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalMes.toLocaleString('es-ES', {
                style: 'currency',
                currency: 'EUR',
              })}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Acciones rápidas
          </h2>

          <div className="grid gap-3">
            <Button variant="outline" className="h-14 justify-start" asChild>
              <Link href="/facturas/nueva">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 mr-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Nueva Factura</p>
                  <p className="text-xs text-muted-foreground">
                    Crear factura rápidamente
                  </p>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-14 justify-start" asChild>
              <Link href="/clientes/nuevo">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 mr-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Nuevo Cliente</p>
                  <p className="text-xs text-muted-foreground">
                    Agregar cliente a tu lista
                  </p>
                </div>
              </Link>
            </Button>
          </div>
        </div>

        {!empresa.cif && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-start gap-3 pt-4">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium text-amber-900">
                  Completa tu empresa
                </p>
                <p className="text-sm text-amber-700">
                  Agrega tu CIF y datos fiscales para generar facturas válidas.
                </p>
                <Button size="sm" variant="outline" className="mt-2" asChild>
                  <Link href="/empresa">Completar datos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}