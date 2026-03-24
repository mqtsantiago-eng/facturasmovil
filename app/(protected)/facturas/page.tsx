// C:\dev\facturasmovil\app\(protected)\facturas\page.tsx

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { Plus, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const estadoColors: Record<string, string> = {
  borrador: 'bg-muted text-muted-foreground',
  emitida: 'bg-blue-100 text-blue-800',
  pagada: 'bg-green-100 text-green-800',
  anulada: 'bg-red-100 text-red-800',
}

const estadoLabels: Record<string, string> = {
  borrador: 'Borrador',
  emitida: 'Emitida',
  pagada: 'Pagada',
  anulada: 'Anulada',
}

export default async function FacturasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!empresa) {
    redirect('/empresa/configurar')
  }

  const { data: facturas } = await supabase
    .from('facturas')
    .select(`
      *,
      cliente:clientes(nombre)
    `)
    .eq('empresa_id', empresa.id)
    .order('created_at', { ascending: false })
    .order('numero_factura', { ascending: false })

  return (
    <div className="flex flex-col min-h-svh bg-muted/20">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Facturas</h1>

          <Button size="default" className="h-10 px-4" asChild>
            <Link href="/facturas/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva
            </Link>
          </Button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 p-4 pb-24">
        {!facturas || facturas.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>

              <EmptyTitle>Sin facturas</EmptyTitle>

              <EmptyDescription>
                Crea tu primera factura en segundos
              </EmptyDescription>
            </EmptyHeader>

            <EmptyContent>
              <Button size="lg" className="w-full" asChild>
                <Link href="/facturas/nueva">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear factura
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-3">
{facturas.map((factura, index) => {

  const fecha = new Date(factura.fecha)

  const mesActual = fecha.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })

  const facturaAnterior = facturas[index - 1]

  const mesAnterior = facturaAnterior
    ? new Date(facturaAnterior.fecha).toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      })
    : null

  const mostrarSeparador = mesActual !== mesAnterior

  return (
    <div key={factura.id}>

      {mostrarSeparador && (
  <div className="sticky top-16 z-10 bg-muted/90 backdrop-blur px-2 py-1 rounded-sm">
    <p className="text-[10px] font-semibold uppercase text-muted-foreground">
      {mesActual}
    </p>
  </div>
)}
      <Link href={`/facturas/${factura.id}`}>
        <Card className="active:scale-[0.97] transition-transform rounded-sm border shadow-sm">
          <CardContent className="p-1">

            {/* LÍNEA 1 */}
            <div className="flex items-center justify-between text-[10px] leading-none mb-0.5">
              <span className="font-mono font-semibold">{factura.numero_factura}</span>
              <span className="text-muted-foreground">
                {new Date(factura.fecha).toLocaleDateString('es-ES')}
              </span>
              <Badge className={`text-[8px] px-1 py-0.5 ${estadoColors[factura.estado]}`}>
                {estadoLabels[factura.estado]}
              </Badge>
            </div>

            {/* LÍNEA 2 */}
            <div className="flex items-center justify-between text-[10px] font-medium leading-none">
              <span className="truncate max-w-[60%]">
                {factura.cliente?.nombre || 'Cliente desconocido'}
              </span>
              <span>
                {Number(factura.total).toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </span>
            </div>

          </CardContent>
        </Card>
      </Link>

    </div>
  )
})}
</div>
        )}
      </div>

      {/* BOTÓN FLOTANTE (CLAVE UX MÓVIL) */}
      {facturas && facturas.length > 0 && (
        <div className="fixed bottom-5 right-5">
          <Button size="lg" className="h-14 w-14 rounded-full shadow-lg" asChild>
            <Link href="/facturas/nueva">
              <Plus className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}